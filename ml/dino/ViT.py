import torch
import torch.nn as nn
import torch.functional as F


class Head(nn.Module):
    """Network connected to the CLS token of the last token embedding. Just
    an MLP with the last layer normalised in a particular way.

    Parameters
    ---
    in_dim: int
        The dimensionality of the token embedding
    out_dim: int
        The num dims for the last layer to calculate the softmax over.
    hidden_dim: int
        The dims of the hidden layers.
    bottleneck_dim: int
        The dims of the second last layer.
    n_layers: int
        Dims of second last layer.
    norm_last_layer: int
        If true, norm the last layer.
    """

    def __init__(
        self,
        in_dim,
        out_dim,
        hidden_dim=512,
        bottleneck_dim=256,
        n_layers=3,
        norm_last_layer=False,
    ):
        super().__init__()
        # define mlp -> from in_dim to bottleneck_dim
        if n_layers == 1:
            self.mlp = nn.Linear(in_dim, bottleneck_dim)
        else:
            layers = [nn.Linear(in_dim, hidden_dim)]
            layers.append(nn.GELU())

            for _ in range(n_layers - 2):
                layers.append(nn.Linear(hidden_dim, hidden_dim))
                layers.append(nn.GELU())
            layers.append(nn.Linear(hidden_dim, bottleneck_dim))
            self.mlp = nn.Sequential(*layers)

        self.apply(self._init_weights)

        self.last_layer = nn.utils.weight_norm(
            nn.Linear(bottleneck_dim, out_dim, bias=False)
        )
        self.last_layer.weight_g.data.fill(1)
        if norm_last_layer:
            self.last_layer.weight_g.requires_grad = False

    def _init_weights(self, m):
        """Initialise learnable params"""
        if isinstance(m, nn.Linear):
            nn.init.normal_(m.weight, std=0.02)
            if m.bias is not None:
                nn.init.constant_(m.bias, 0)

    def forward(self, x):
        x = self.mlp(x)  # (n_samples, bottleneck_dim)
        n = nn.functional.normalize(x, dim=-1, p=2)  # (n_samples, bottleneck_dim)
        x = self.last_layer(x)

        return x


class MultiCropWrapper:
    """Class for forward pass for multiple crops.

    Parameters
    ---
    backbone: timm.models.vision_transformer.VisionTransformer

    new_head: Head
    """

    def __init__(self, backbone, new_head):
        super().__init__()

        backbone.head = nn.Identity  # deactivate the original head of backbone
        self.backbone = backbone
        self.new_head = new_head

    def forward(self, x):
        """Run the forward pass

        The different crops are concatenated along the batch dimension and then
        a single forward pass is run. The resulting tensor is then chuncked
        back to per crop tensors.

        Args:
            x (list): List of crops
        """
        n_crops = len(x)
        concatenated = torch.cat(x, dim=0)
        cls_embedding = self.backbone(concatenated)
        logits = self.new_head(cls_embedding)
        chunks = logits.chunk(n_crops)

        return chunks


class Loss(nn.Module):
    """The loss function.

    We subclass `nn.Module` since we want to create a buffer for the logits
    center of the teacher. This vector is also called the center.
    """

    def __init__(
        self,
        out_dim,
        teacher_temp=0.04,  # default temp of the teacher is lower than that of the student. Called sharpening
        student_temp=0.1,
        center_momentum=0.9,
    ):
        super().__init__()
        self.student_temp = student_temp
        self.teacher_temp = teacher_temp
        self.center_momentum = center_momentum
        self.register_buffer("center", torch.zeros(1, out_dim))

    def forward(self, student_output, teacher_output):
        student_temp = [s / self.student_temp for s in student_output]
        # Since the teacher temp is lower than the student temp, it will
        # sharpen the distribution of the teacher wrt student. The centering
        # will bring the distribution closer to uniform dist. This
        # counter-balance is really important for stability.
        teacher_temp = [(t - self.center) / self.teacher_temp for t in teacher_output]

        student_sm = [F.log_softmax(s, dim=-1) for s in student_temp]
        # Using detach for teacher since the teacher network is not trained.
        teacher_sm = [F.softmax(t, dim=-1).detach() for t in teacher_temp]

        total_loss = 0
        n_loss_terms = 0

        for t_ix, t in enumerate(teacher_sm):
            for s_ix, s in enumerate(student_sm):
                if t_ix == s_ix:
                    continue
                # calculate cross-entropy for all the samples and then
                # calculate the average.
                loss = torch.sum(-t * s, dim=-1)
                total_loss += loss.mean()
                n_loss_terms += 1
        total_loss /= n_loss_terms

        self.update_center(teacher_output)

        return total_loss

    @torch.no_grad()
    def update_center(self, teacher_output):
        """Update the center used for teacher output.

        Computer the exponential moving average.
        """
        batch_center = torch.cat(teacher_output).mean(dim=0, keepdim=True)
        self.center = self.center * self.center_momentum + batch_center * (
            1 - self.center_momentum
        )


def gradient_clip(model, clip=2.0):
    for p in model.parameters():
        if p.grad is not None:
            param_norm = p.grad.data.norm()
            clip_coef = clip / (param_norm + 1e-6)

            if clip_coef < 1:
                p.grad.data.mul_(clip_coef)

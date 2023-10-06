import torch.nn as nn
import torch.nn.functional as F
import torchvision.transforms as transforms


from PIL import Image


class DataAugmentations:
    def __init__(
        self,
        global_crops_scale=(0.4, 1),  # The range of sizes for the global crops
        local_crops_scale=(0.05, 0.4),  # The range of sizes for local crops
        n_local_crops=8,  # Higher this number, more memory we need
        size=224,  # The size of the final image -> the requried input size
        # for the ViT we will use.
    ):
        self.n_local_crops = n_local_crops
        # a function that returns a transformation that applies GaussianBlur
        # randomly with probability `p`.
        RandomGaussianBlur = lambda p: transforms.RandomApply(
            [transforms.GaussianBlur(kernel_size=5, sigma=(0.1, 2))], p=p
        )

        flip_and_jitter = transforms.Compose(
            [
                transforms.RandomHorizontalFlip(p=0.5),
                transforms.RandomApply(
                    [
                        transforms.ColorJitter(
                            brightness=0.4, contrast=0.4, saturation=0.2, hue=0.1
                        )
                    ]
                ),
                transforms.RandomGrayscale(p=0.2),
            ]
        )

        normalize = transforms.Compose(
            [
                transforms.ToTensor(),
                transforms.Normalize((0.485, 0.456, 0.406), (0.229, 0.224, 0.225)),
            ]
        )

        self.global_1 = transforms.Compose(
            [
                transforms.RandomResizedCrop(
                    size, scale=global_crops_scale, interpolation=Image.BICUBIC
                ),
                flip_and_jitter,
                RandomGaussianBlur(1.0),
                normalize,
            ]
        )

        self.global_2 = transforms.Compose(
            [
                transforms.RandomResizedCrop(
                    size, scale=global_crops_scale, interpolation=Image.BICUBIC
                ),
                flip_and_jitter,
                RandomGaussianBlur(0.1),
                transforms.RandomSolarize(170, p=0.2),
                normalize,
            ]
        )

        self.local = transforms.Compose(
            [
                transforms.RandomResizedCrop(
                    size,  # the final size of the image is same for both
                    # local and global views. It's just easier
                    scale=local_crops_scale,
                    interpolation=Image.BICUBIC,
                ),
                flip_and_jitter,
                RandomGaussianBlur(0.5),
                normalize,
            ]
        )

    def __call__(self, image):
        all_crops = []
        # The first two images in the list are global crops.
        all_crops.append(self.global_1(image))
        all_crops.append(self.global_2(image))

        all_crops.extend([self.local(image) for _ in range(self.n_local_crops)])

        return all_crops

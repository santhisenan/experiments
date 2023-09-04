import torch
import torch.nn as nn
import torch.optim as optim

import albumentations as A
from albumentations.pytorch import ToTensorV2

from tqdm import tqdm

from model import UNET
from utils import (
    save_checkpoint,
    load_checkpoint,
    get_loaders,
    save_predictions_as_images,
    check_accuracy,
)

# hyperparameters
LEARNING_RATE = 1e-4
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
BATCH_SIZE = 16
NUM_EPOCHS = 3
NUM_WORKERS = 12
IMAGE_HEIGHT = 160
IMAGE_WIDTH = 240

PIN_MEMORY = True
LOAD_MODEL = False
TRAIN_IMAGE_DIR = "/media/user1/Work/Downloads/Carvana Dataset/train"
TRAIN_MASK_DIR = "/media/user1/Work/Downloads/Carvana Dataset/train_masks"
VAL_IMAGE_DIR = "/media/user1/Work/Downloads/Carvana Dataset/val"
VAL_MASK_DIR = "/media/user1/Work/Downloads/Carvana Dataset/val_masks"
SAVE_IMAGES_DIR = "/media/user1/Work/Downloads/Carvana Dataset/model_outputs"


def train(loader, model, optimizer, loss_fn, scaler):
    loop = tqdm(loader)
    for batch_index, (data, targets) in enumerate(loop):
        data = data.to(device=DEVICE)
        targets = targets.float().unsqueeze(1).to(device=DEVICE)
        # forward
        # float16 training
        with torch.cuda.amp.autocast():
            predictions = model(data)
            loss = loss_fn(predictions, targets)

        # backward
        optimizer.zero_grad()

        scaler.scale(loss).backward()
        scaler.step(optimizer)
        scaler.update()

        # update the tqdm loop
        loop.set_postfix(loss=loss.item())


def main():
    train_transform = A.Compose(
        [
            A.Resize(height=IMAGE_HEIGHT, width=IMAGE_WIDTH),
            A.Rotate(limit=35, p=1.0),
            A.HorizontalFlip(p=0.5),
            A.VerticalFlip(p=0.1),
            A.Normalize(
                mean=[0.0, 0.0, 0.0], std=[1.0, 1.0, 1.0], max_pixel_value=255.0
            ),
            ToTensorV2(),
        ]
    )

    val_transform = A.Compose(
        [
            A.Resize(height=IMAGE_HEIGHT, width=IMAGE_WIDTH),
            A.Normalize(
                mean=[0.0, 0.0, 0.0], std=[1.0, 1.0, 1.0], max_pixel_value=255.0
            ),
            ToTensorV2(),
        ]
    )

    model = UNET(in_channels=3, out_channels=1).to(DEVICE)
    loss_fn = nn.BCEWithLogitsLoss()
    optimizer = optim.Adam(model.parameters(), lr=LEARNING_RATE)

    train_loader, val_loader = get_loaders(
        TRAIN_IMAGE_DIR,
        TRAIN_MASK_DIR,
        VAL_IMAGE_DIR,
        VAL_MASK_DIR,
        BATCH_SIZE,
        train_transform,
        val_transform,
        NUM_WORKERS,
        PIN_MEMORY,
    )

    scaler = torch.cuda.amp.GradScaler()

    if LOAD_MODEL:
        load_checkpoint(torch.load("checkpoint.pth.tar"), model)

        # check accuracy
        check_accuracy(val_loader, model, DEVICE)

    for epoch in range(NUM_WORKERS):
        train(train_loader, model, optimizer, loss_fn, scaler)

        # save model
        checkpoint = {
            "state_dict": model.state_dict(),
            "optimizer": optimizer.state_dict(),
        }
        save_checkpoint(checkpoint)

        # check accuracy
        check_accuracy(val_loader, model, DEVICE)

        # save some predictions to a folder
        save_predictions_as_images(
            val_loader, model, folder=SAVE_IMAGES_DIR, device=DEVICE
        )


if __name__ == "__main__":
    main()

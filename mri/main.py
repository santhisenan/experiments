from pathlib import Path

import imageio as iio
import scipy.ndimage as ndi
import numpy as np
import matplotlib.pyplot as plt


DATA_LOCATION = Path(
    "/Users/santhisenan/Documents/Datasets/MRI Data 200/BRAINIX/DICOM/T1/"
)

file_name = "BRAINIX_DICOM_T1_IM-0001-0001.dcm"

brain_slice = iio.imread(DATA_LOCATION / file_name)

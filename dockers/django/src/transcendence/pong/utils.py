import os
from django.utils.deconstruct import deconstructible

@deconstructible
class UploadTo(object):
    def __init__(self, path):
        self.path = path

    def __call__(self, instance, filename):
        return os.path.join(self.path, filename)
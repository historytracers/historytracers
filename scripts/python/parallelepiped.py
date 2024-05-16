import matplotlib.pyplot as plt
import numpy as np

axes = [2, 5, 10]

data = np.ones(axes, dtype=bool)

fig = plt.figure()

ax = fig.add_subplot(111, projection='3d')
ax.voxels(data)

fig.savefig("parallelepiped.jpg")

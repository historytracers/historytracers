# SPDX-License-Identifier: GPL-3.0-or-later

# Modified example from https://stackoverflow.com/questions/39408794/python-3d-pyramid

from matplotlib import pyplot as plt
from mpl_toolkits.mplot3d.art3d import Poly3DCollection, Line3DCollection
import numpy as np

fig = plt.figure()
img = fig.add_subplot(1, 1, 1, projection='3d')

# vertices of a pyramid
v = np.array([[-2, -2, -2], [2, -2, -2], [2, 2, -2],  [-2, 2, -2], [0, 0, 2]])
img.scatter3D(v[:, 0], v[:, 1], v[:, 2])

vertice = [[v[0],v[1],v[4]],
           [v[0],v[3],v[4]],
           [v[2],v[1],v[4]],
           [v[2],v[3],v[4]],
           [v[0],v[1],v[2],v[3]]
          ]

# plot sides
img.add_collection3d(Poly3DCollection(vertice, 
                                      facecolors='green',
                                      edgecolors='g',
                                      linewidths=1,
                                      alpha=.10)
                    )

plt.savefig("pyramid.jpg")

# SPDX-License-Identifier: GPL-3.0-or-later

# Modified example from https://stackoverflow.com/questions/39408794/python-3d-pyramid
# Coordinates from https://polyhedra.tessera.li/pentagonal-pyramid/info

from matplotlib import pyplot as plt
from mpl_toolkits.mplot3d.art3d import Poly3DCollection, Line3DCollection
import numpy as np

fig = plt.figure()
img = fig.add_subplot(1, 1, 1, projection='3d')

# vertices of a pyramid
v = np.array([[3, 0, 2], [5, 3, 2], [4, 5, 2],  [1, 4, 2], [0, 1, 2], [2.5, 2.5, 7]])
img.scatter3D(v[:, 0], v[:, 1], v[:, 2])

vertice = [[v[0],v[1],v[5]],
           [v[0],v[4],v[5]],
           [v[2],v[1],v[5]],
           [v[2],v[3],v[5]],
           [v[3],v[4],v[5]],
           [v[0],v[1],v[2],v[3],v[4],v[5]]
          ]

# plot sides
img.add_collection3d(Poly3DCollection(vertice, 
                                      facecolors='green',
                                      edgecolors='g',
                                      linewidths=1,
                                      alpha=.10)
                    )

plt.savefig("pentagonal_pyramid.jpg")

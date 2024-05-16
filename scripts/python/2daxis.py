# Example from https://matplotlib.org/stable/api/_as_gen/matplotlib.pyplot.grid.html
import matplotlib.pyplot as plt
import numpy as np

fig1, ax = plt.subplots()

ax.set_xlim(0, 2)
ax.set_ylim(0, 3)
ax.grid(True)
ax.set_box_aspect(1)

plt.show()

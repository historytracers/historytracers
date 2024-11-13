# SPDX-License-Identifier: GPL-3.0-or-later

import matplotlib.pyplot as plt
import numpy as np
from matplotlib.ticker import FuncFormatter, MultipleLocator

fig,ax = plt.subplots()

theta = np.linspace(-2*np.pi, 2*np.pi, 1000)
s = np.sin(theta)
c = np.cos(theta)

ax.xaxis.set_major_formatter(FuncFormatter(
   lambda val,pos: '{:.0g}$\pi$'.format(val/np.pi) if val !=0 else '0'
))
ax.xaxis.set_major_locator(MultipleLocator(base=np.pi))

ax.plot(theta, s, color='red', label='sin (θ)')
ax.plot(theta, c, color='darkblue', label='cos (θ)')

plt.xlabel('θ values')
plt.ylabel('Values for  sin (θ) and cos (θ)')
plt.legend()
plt.savefig("SineCos.jpg")

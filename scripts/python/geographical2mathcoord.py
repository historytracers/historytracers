import numpy as np
from argparse import ArgumentParser

if __name__ == '__main__':
    parser = ArgumentParser()
    parser.add_argument("-r", "--radius", dest="eradius",
                        help="Radius value", metavar="RADIUS")
    parser.add_argument("-l", "--longitude", dest="longitude",
                        help="The longitude (theta) value", metavar="THETA")
    parser.add_argument("-a", "--latitude", dest="latitude",
                        help="The latitude (phi) value", metavar="PHI")

    args = parser.parse_args()
    print("The Spherical values given in grades: ("+args.eradius+", "+args.longitude+", "+args.latitude+")")

    longitudevalue = float(args.longitude)*np.pi/180
    latitudevalue = (90 - float(args.latitude))*np.pi/180
    radiusvalue = float(args.eradius)

    print("The Spherical values in radianes: ("+args.eradius+", "+str(longitudevalue)+", "+str(latitudevalue)+")")

    x = radiusvalue * np.cos(longitudevalue) * np.sin(latitudevalue)
    y = radiusvalue * np.sin(longitudevalue) * np.sin(latitudevalue)
    z = radiusvalue * np.cos(latitudevalue)

    print("Their correspondent Cartesian coordinates are: ("+str(x)+", "+str(y)+", "+str(z)+")")

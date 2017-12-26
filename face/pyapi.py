"""API from `cosmo` electron application to `cosmocalc` python package.
"""
import datetime
import os

import numpy as np
import zerorpc

import cosmocalc

out = open('pylog.txt', 'w')
out.write('api.py\n')

cosmo = cosmocalc.get_cosmology()

# Save the grid of cosmological values to a local file
GRID_FNAME = "cosmo_grid.csv"
grid, names = cosmo.get_grid()
np.savetxt(GRID_FNAME, grid, delimiter=',', header=','.join(names))
out.write("Saved to '{}' ({})".format(GRID_FNAME, os.path.exists(GRID_FNAME)))


class CalcApi:

    def __init__(self):
        out.write("CalcApi()\n")

    def calc(self, args):
        """based on the input text, return the int result"""
        beg = datetime.datetime.now()
        out.write("CalcApi.calc()\n")
        _log("args = '{}'".format(args))
        msg = 'Calculation '

        try:
            name, _val = args
            _log("name = '{}', val = '{}'".format(name, _val))
            rv = cosmocalc.api(name, _val, cosmo=cosmo)
            msg += 'succeeded.'
        except Exception as e:
            _log("\nException: '{}'\n".format(str(e)))
            msg += "failed.  Error: '{}'".format(str(e))

        msg += ' After {}'.format(datetime.datetime.now() - beg)
        retval = {'dict': rv,
                  'msg': msg}
        return retval

    def echo(self, anything):
        """Test function for javascript interface.
        """
        return anything


def parse_port():
    return 4242


def _log(msg):
    out.write(str(msg) + "\n")
    print(msg)
    out.flush()
    return


def main():
    _log("api.main()\n")
    addr = 'tcp://127.0.0.1:' + str(parse_port())
    s = zerorpc.Server(CalcApi())
    s.bind(addr)
    _log('start running on {}'.format(addr))
    s.run()


if __name__ == '__main__':
    main()
    # CalcApi().calc(['z', '0.1'])

"""
"""
import datetime

import numpy as np
import astropy as ap
import astropy.cosmology  # noqa

import zerorpc


out = open('pylog.txt', 'w')
out.write('api.py\n')

cosmo = ap.cosmology.WMAP9


class CalcApi:
    def __init__(self):
        out.write("CalcApi()\n")

    def calc(self, args):
        """based on the input text, return the int result"""
        beg = datetime.datetime.now()
        out.write("CalcApi.calc()\n")
        _log("args = '{}'".format(args))
        retval = 0.0
        msg = 'Calculation '

        try:
            name, _val = args
            _val = np.float(_val)
            _log("name = '{}', val = '{}'".format(name, _val))
            if name == 'z':
                retval = cosmo.luminosity_distance(_val)
                _log("retval = '{}'; value = '{}'".format(retval, retval.value))
                # Get the numerical value (instead of astrpy quantity)
                val = retval.value
                uname = retval.unit.name
                # Convert to str
                retval = "{:.2f} {}".format(val, uname)

            else:
                raise ValueError("name = '{}' unimplemented".format(name))

            msg += 'succeeded.'
        except Exception as e:
            _log("\nException: '{}'\n".format(str(e)))
            msg += "failed.  Error: '{}'".format(str(e))

        msg += ' After {}'.format(datetime.datetime.now() - beg)
        return retval, msg

    def echo(self, anything):
        """Test function for javascript interface.
        """
        return anything


def parse_port():
    return 4242


def _log(msg):
    out.write(msg + "\n")
    print(msg)
    out.flush()
    return


def main():
    out.write("api.main()\n")
    addr = 'tcp://127.0.0.1:' + str(parse_port())
    s = zerorpc.Server(CalcApi())
    s.bind(addr)
    # print('start running on {}'.format(addr))
    out.write('start running on {}'.format(addr))
    s.run()


if __name__ == '__main__':
    main()

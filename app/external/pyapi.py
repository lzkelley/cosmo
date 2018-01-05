"""API from `cosmo` electron application to `cosmopy` python package.
"""
import datetime
import os
import sys

import numpy as np
import zerorpc

import cosmopy

# This is the parent directory of this script.
#    When running in development environment (i.e. source files directly), then parent dir
#        e.g. 'cosmo/app'
#    When running from package, then location of 'extraResources'
#        e.g. 'cosmo.app/Contents/Resources/external/'
_DIR_APP = os.path.abspath(os.path.join(os.path.dirname(__file__), os.path.pardir))

_DIR_USER = os.path.abspath(os.path.expanduser('~'))
_PATH_SETS = os.path.join(_DIR_APP, "external", "settings.txt")
_MY_NAME = "pyapi.py"

_SETS_ILLEGAL_CHARS = ["\'", "\""]


#  ====  Load Settings and Log File  ====

def load_settings():
    if not os.path.exists(_PATH_SETS):
        print("{}:".format(_MY_NAME))
        raise IOError("Settings file missing '{}'".format(_PATH_SETS))

    contents = open(_PATH_SETS).read()
    check = True
    for ic in _SETS_ILLEGAL_CHARS:
        if ic in contents:
            check = False

    if not check:
        raise ValueError(
            "Error: Settings file '{}' should not contain quotation marks!".format(_PATH_SETS)
        )

    str_sets = [lin.strip() for lin in contents.split('\n')]
    sets = {}
    for lin in str_sets:
        if lin.startswith('#') or len(lin.strip()) == 0:
            continue
        kk, vv = [ll.strip() for ll in lin.split('=')]
        sets[kk] = vv

    return sets


def log(msg, stdout=False):
    dt = datetime.datetime.now().strftime('%Y/%m/%d-%H:%M:%S')
    str_out = "{} :: {} :: {}".format(dt, _MY_NAME, msg)
    if stdout:
        print(str_out)
    with open(PATH_LOG, 'a') as out:
        out.write(str_out + "\n")
        out.flush()
    return


try:
    sets = load_settings()
    FNAME_LOG = sets["FNAME_LOG"]
    FNAME_DATA = sets["FNAME_COSMO_DATA"]
    # PATH_LOG = os.path.join(_DIR_APP, FNAME_LOG)
    PATH_LOG = os.path.join(_DIR_USER, FNAME_LOG)
    PATH_DATA = os.path.join(_DIR_APP, FNAME_DATA)
    _data_dir = os.path.dirname(PATH_DATA)
    if not os.path.exists(_data_dir):
        os.makedirs(_data_dir)
    print("{} :: log path: '{}'".format(_MY_NAME, PATH_LOG))
except IOError:
    raise
except Exception:
    print("{}:".format(_MY_NAME))
    print("Failed to load settings!")
    raise

log("Started and initialized.", True)

log("Loading cosmology instance")
cosmo = cosmopy.get_cosmology()
log("\tcosmology instance loaded")


def main():
    log("pyapi.main()")
    save_cosmo_data()
    # sys.exit(232)

    addr = 'tcp://127.0.0.1:' + str(parse_port())
    s = zerorpc.Server(CalcApi())
    s.bind(addr)
    log('start running on {}'.format(addr))
    s.run()


def save_cosmo_data():
    log("pyapi.save_cosmo_data()")
    # Save the grid of cosmological values to a local file
    try:
        grid, names, units = cosmo.get_grid()
        np.savetxt(PATH_DATA, grid, delimiter=',', header=','.join(names), comments='')
    except:
        log("Failed to save cosmological data!")
        raise
    else:
        log("Saved to '{}' ({})".format(PATH_DATA, os.path.exists(PATH_DATA)), True)

    return


def parse_port():
    return 4242


class CalcApi:

    def __init__(self):
        log("CalcApi()", stdout=True)

    def calc(self, args):
        """based on the input text, return the int result"""
        beg = datetime.datetime.now()
        log("CalcApi.calc()")
        log("args = '{}'".format(args))
        msg = 'Calculation '

        try:
            name, _val = args
            log("name = '{}', val = '{}'".format(name, _val))
            rv = cosmopy.api(name, _val, cosmo=cosmo)
            log("rv = {} ({}) : d = {} ({})".format(rv, type(rv), rv['dl'], type(rv['dl'])))
            msg += 'succeeded.'
        except Exception as e:
            log("\nException: '{}'\n".format(str(e)))
            msg += "failed.  Error: '{}'".format(str(e))

        msg += ' After {}'.format(datetime.datetime.now() - beg)
        log(msg)
        retval = {'dict': rv,
                  'msg': msg}
        return retval

    def echo(self, anything):
        """Test function for javascript interface.
        """
        log("CalcApi.echo()")
        return anything


if __name__ == '__main__':
    main()
    # CalcApi().calc(['z', '0.1'])

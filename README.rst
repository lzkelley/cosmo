cosmo
=====

A cosmological calculator application using Electron and python.

Installation
------------

from dmg, as application
^^^^^^^^^^^^^^^^^^^^^^^^
The application installed via the dmg file (i.e. drag-and-dropped into applications) will only work if your python environment includes the required packages.  You will need to install the packages: zerorpc_ and cosmopy_, e.g.

    `$ pip install zerorpc cosmopy`

To test that they work correctly, open a new terminal and run the command:

    `$ python -c "import zerorpc; import cosmopy"`

This command should exit without any errors, in which case this `cosmo` application should work!


from source, in development
^^^^^^^^^^^^^^^^^^^^^^^^^^^

-   (Current) Successful installation instructions:
    -   Use an environment where *python2* is the default.
    -   `$ npm install`
    -   `$ npm rebuild zerorpc --runtime=electron --target=1.8.1`   # maybe not needed?
    -   `$ npm rebuild zmq --runtime=electron --target=1.8.1`       # maybe not needed?
    -   `$ ./node_modules/.bin/electron-rebuild`
-   When packaging (i.e. with `npm run dist`), *python2* must still be the default python!


- Run ``npm install``
  - This won't work with python versions > 3.0.0, so you may need to point to a particular python version, e.g.

    ``npm install --python=python2.7``

  or    

    ``npm install --python=/usr/bin/python``

  - The build of `zeromq` might also have a conflict between Node and Electron (or something?), and may require rebuilding, so this has been added to the npm 'postinstall':
    `npm rebuild zeromq --runtime=electron --target=1.7.2`
    where `1.7.2` is the particular version of electron being used.


.. _zerorpc: https://github.com/0rpc/zerorpc-python
.. _cosmopy: https://github.com/lzkelley/cosmopy

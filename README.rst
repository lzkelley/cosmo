cosmo
=====

A cosmological calculator application using Electron and python.

Installation
------------
- Run `npm install`
  - This won't work with python versions > 3.0.0, so you may need to point to a particular python version, e.g.
    `npm install --python=python2.7` or  
    `npm install --python=/usr/bin/python`

  - The build of `zeromq` might also have a conflict between Node and Electron (or something?), and may require rebuilding, so this has been added to the npm 'postinstall':
    `npm rebuild zeromq --runtime=electron --target=1.7.2`
    where `1.7.2` is the particular version of electron being used.

# -*- mode: python -*-

block_cipher = None


a = Analysis(['app/external/pyapi.py'],
             pathex=['/Users/lzkelley/Programs/cosmo'],
             binaries=[],
             datas=[],
             hiddenimports=['six'],
             hookspath=[],
             runtime_hooks=[],
             excludes=['matplotlib'],
             win_no_prefer_redirects=False,
             win_private_assemblies=False,
             cipher=block_cipher)
pyz = PYZ(a.pure, a.zipped_data,
             cipher=block_cipher)
exe = EXE(pyz,
          a.scripts,
          a.binaries,
          a.zipfiles,
          a.datas,
          name='pyapi',
          debug=False,
          strip=False,
          upx=True,
          runtime_tmpdir=None,
          console=True )

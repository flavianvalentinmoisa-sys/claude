import sys
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools import subset
src, out, pin = sys.argv[1], sys.argv[2], sys.argv[3] if len(sys.argv)>3 else ''
f = TTFont(src, lazy=False)
cmap = f.getBestCmap()
need = {0x0102:'Ă',0x0103:'ă',0xC2:'Â',0xE2:'â',0xCE:'Î',0xEE:'î',0x0218:'Ș',0x0219:'ș',0x021A:'Ț',0x021B:'ț',0x015E:'Ş',0x015F:'ş',0x0162:'Ţ',0x0163:'ţ',0x201E:'„',0x201D:'”',0x2013:'–',0x2014:'—',0x20AC:'€',0x2026:'…',0x00AB:'«',0x00BB:'»'}
missing=[v for k,v in need.items() if k not in cmap]
print(src.split('/')[-1], 'axes', [a.axisTag for a in f['fvar'].axes], 'missing:', missing or 'niciunul')
unicodes = list(range(0x20,0x7F)) + list(range(0xA0,0x180)) + [0x0218,0x0219,0x021A,0x021B,0x02C6,0x02C7,0x02D8,0x02D9,0x02DA,0x02DB,0x02DC,0x02DD] + list(range(0x2000,0x2070)) + [0x20AC,0x20BD,0x2116,0x2122,0x2190,0x2191,0x2192,0x2193,0x2212,0x2215,0x2713,0x2715,0xFEFF,0xFFFD]
opts = subset.Options()
opts.flavor = 'woff2'
opts.layout_features = ['*']
opts.name_IDs = ['*']
opts.notdef_outline = True
opts.desubroutinize = True
s = subset.Subsetter(opts)
s.populate(unicodes=unicodes)
s.subset(f)
if pin:
    k,v = pin.split('=')
    f = instancer.instantiateVariableFont(f, {k: float(v)})
f.flavor='woff2'
f.save(out)
import os; print(' ->', out.split('/')[-1], os.path.getsize(out)//1024, 'KB')

import sys, os, glob, runpy
sys.path.insert(0, os.path.dirname(__file__))
root = sys.argv[1]
only = sys.argv[2:] 
for f in sorted(glob.glob(os.path.join(os.path.dirname(__file__), 'specs', '*.py'))):
    name = os.path.basename(f)[:-3]
    if only and name not in only: continue
    runpy.run_path(f, init_globals={'PATH': root})
    print('ok', name)

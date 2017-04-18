 cd web
 npm run build
 cd ..
 go generate
 go build
 ./scope serve -p 4040 -H ~/Data/hic/K562_combined.hic   -B bw.tsv -S structure_3

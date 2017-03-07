 cd web
 npm run build
 cd ..
 go generate
 go build
 ./scope serve -p 4040 -H ~/Data/hic/test.hic   -B bw.tsv

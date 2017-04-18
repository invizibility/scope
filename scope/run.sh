 cd web
 npm run build
 cd ..
 go generate
 go build
 ./scope serve -p 4040 -H hics.txt   -B bw.tsv -S structure_3

#!/bin/bash
cd libs/proto
protoc --plugin=protoc-gen-ts_proto=node_modules/.bin/protoc-gen-ts_proto \
       --ts_proto_out=. --ts_proto_opt=esModuleInterop=true,outputServices=grpc-js \
       --proto_path=../../proto *.proto
chmod +x scripts/generate-proto.sh
./scripts/generate-proto.sh
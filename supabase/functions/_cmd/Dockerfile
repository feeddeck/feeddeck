 FROM denoland/deno:1.45.2

WORKDIR /app

COPY . .

RUN deno cache --import-map ./import_map.json _cmd/cmd.ts

ENTRYPOINT ["/bin/deno", "run", "--allow-net", "--allow-env", "--import-map", "./import_map.json", "_cmd/cmd.ts"]

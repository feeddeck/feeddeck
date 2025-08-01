FROM denoland/deno:2.4.3

WORKDIR /app

COPY . .

RUN deno install _cmd/cmd.ts

ENTRYPOINT ["/bin/deno", "run", "--allow-net", "--allow-env", "_cmd/cmd.ts"]

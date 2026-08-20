// PM2 process manager config for running the backend on an EC2 instance.
// Usage on the server (inside Backend/):
//   npm install --production
//   pm2 start ecosystem.config.cjs
//   pm2 save && pm2 startup   (to survive reboots)
module.exports = {
  apps: [
    {
      name: "ctrms-backend",
      script: "server.js",
      cwd: __dirname,
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
      },
      max_memory_restart: "300M",
      out_file: "./logs/out.log",
      error_file: "./logs/error.log",
      merge_logs: true,
      time: true,
    },
  ],
};

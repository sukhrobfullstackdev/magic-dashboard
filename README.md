# Magic Dashboard

## Local development guide

- See [ONBOARDING.md](./ONBOARDING.md) for initial setup

## Infra

### Update Dependabot terraform config

Because of the way that Dependabot works, you need to update the terraform part of the dependabot config listing all directories that have `versions.tf` or modules. It's pretty much each folder that have `*.tf` file. So in order to make this operation easier, simply run:

```sh
  for i in $(find deploy -type f -name '*.tf' -not -path '*/.terraform/*' -not -path '*/.tfsec/*' | xargs dirname  | sort -u); \
    do cat dependabot_terraform.yaml.tpl| sed "s~DIR_NAME~${i}~"; \
  done
```

And replace `updates` in the `.github/dependabot.yml` file after the `# terraform block #` comment with output you've just got.

#### Install and configure the CLI

First, we need to setup the CLI on our local machine:

1. Install globally: `pnpm add -g vercel` (alternative: use `npx` to run vercel commands)
2. Ensure it was installed correctly: `vercel --version`
3. Login: `vercel login`
4. This will take you into the browser to authenticate with your Vercel account
5. Back in your terminal, verify with `vercel whoami`
6. Switch to our team: `vercel switch magiclabs`
7. Link your local mandrake to the project in Vercel: `vercel link`
8. It will run through a series of questions. Make sure to select "Magic Labs" as the scope and it should automatically find `magiclabs/magic-dashboard`. Just say yes from there.
9. Enable 3rd party cookies in your browser via Setting -> cookies -> add localhost:3015 to the allowlist
10. You're all set!

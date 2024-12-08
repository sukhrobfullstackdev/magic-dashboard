# Developer Onboarding Guide

- Last Updated: 2023-08-31
- Author: Chris Yang([@ysm-dev](https://github.com/ysm-dev))

## Introduction

This guide assumes that you just got a new Macbook and nothing is set up yet. If you already have some of the tools installed, you can skip those steps.

## Setup

#### 1. Install [Homebrew](https://brew.sh/) for MacOS package management

- Run `Terminal.app` and paste the following command

```sh
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

#### 2. Install [iTerm2](https://iterm2.com/) or [Warp](https://www.warp.dev/) for a better terminal experience

```sh
brew install --cask iterm2
```

or

```sh
brew install --cask warp
```

- Use [iTerm2](https://iterm2.com/) or [Warp](https://www.warp.dev/) instead of Terminal.app for the better terminal experience

#### 3. Install development tools

```sh
brew install --cask docker visual-studio-code &&\
brew tap aws/tap &&\
brew install gh nvm pyenv pnpm pre-commit aws-sam-cli awscli jq poetry &&\
nvm install 20 &&\
pyenv install 3.9.13
```

- Run [Docker](https://www.docker.com/).

```sh
open -a Docker
```

#### 4. Login with GitHub CLI

```sh
gh auth -s admin:public_key login
```

- Select `GitHub.com` and press enter

```sh
? What account do you want to log into?
> GitHub.com
  GitHub Enterprise Server
```

- Select `HTTPS` and press enter

```sh
? What is your preferred protocol for Git operations?
> HTTPS
  SSH
```

- Select `Yes` and press enter

```sh
? Authenticate Git with your GitHub credentials?
> Yes
  No
```

- Select `Login with a web browser` and follow the instructions
- You can use your personal GitHub account

```sh
? How would you like to authenticate GitHub CLI?
> Login with a web browser
  Paste an authentication token
```

#### 5. Setup ssh key

- Replace `your_email@example.com` with your GitHub email address.

```sh
ssh-keygen -t ed25519 -C "your_email@example.com"
```

- Leave the filename blank

```sh
> Enter a file in which to save the key (/Users/YOU/.ssh/id_ed25519): [Press enter]
```

- Enter same passphrase twice

```sh
> Enter passphrase (empty for no passphrase): [Type a passphrase]
> Enter same passphrase again: [Type passphrase again]
```

- Add ssh key to ssh-agent

```sh
echo "\
Host HOSTNAME\n\
  AddKeysToAgent yes\n\
  UseKeychain yes\n\
  IdentityFile ~/.ssh/id_ed25519\
" > ~/.ssh/config &&

ssh-add --apple-use-keychain ~/.ssh/id_ed25519
```

- Add ssh key to GitHub

```sh
gh ssh-key add ~/.ssh/id_ed25519.pub
```

- Go to [GitHub SSH and GPG keys settings](https://github.com/settings/keys), Click `Configure SSO` button and Authorize for both `fortmatic` and `magiclabs` organizations and follow the instructions

![](https://bafkreietksslw7f54oa6oj6nhvxdhejqheaw7gltgre33quxjdaojtsgzi.ipfs.dweb.link/)

#### 5. Install and configure the CLI

First, we need to setup the CLI on our local machine:

1. Install globally: `pnpm i -g vercel` (alternative: use `pnpx` to run vercel commands)
2. Ensure it was installed correctly: `vercel --version`
3. Login: `vercel login`
4. This will take you into the browser to authenticate with your Vercel account
5. Back in your terminal, verify with `vercel whoami`
6. Switch to our team: `vercel switch magiclabs`
7. Link your local mandrake to the project in Vercel: `vercel link`
8. It will run through a series of questions. Make sure to select "Magic Labs" as the scope and it should automatically find `magiclabs/mandrake`. Just say yes from there.
9. You're all set!

#### 6. Go to localhost:3015

- You should see the magic-dashboard login page

![](https://bafybeicbfztetvf4p2qbsdcvjfto7vgkfchjzhkesyda2aajcf2orbyrne.ipfs.dweb.link/)

- Login with your `@magic.link` email address and start developing! 🥳

- If you cannot login with your email, then use alias

- e.g. `abcd@magic.link` -> `abcd+1@magic.link`# Developer Onboarding Guide

- Last Updated: 2023-08-31
- Author: Chris Yang([@ysm-dev](https://github.com/ysm-dev))

## Introduction

This guide assumes that you just got a new Macbook and nothing is set up yet. If you already have some of the tools installed, you can skip those steps.

## Setup

#### 1. Install [Homebrew](https://brew.sh/) for MacOS package management

- Run `Terminal.app` and paste the following command

```sh
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

#### 2. Install [iTerm2](https://iterm2.com/) or [Warp](https://www.warp.dev/) for a better terminal experience

```sh
brew install --cask iterm2
```

or

```sh
brew install --cask warp
```

- Use [iTerm2](https://iterm2.com/) or [Warp](https://www.warp.dev/) instead of Terminal.app for the better terminal experience

#### 3. Install development tools

```sh
brew install --cask docker visual-studio-code &&\
brew tap aws/tap &&\
brew install gh nvm pyenv pnpm pre-commit aws-sam-cli awscli jq poetry &&\
nvm install 20 &&\
pyenv install 3.9.13
```

- Run [Docker](https://www.docker.com/).

```sh
open -a Docker
```

#### 4. Login with GitHub CLI

```sh
gh auth -s admin:public_key login
```

- Select `GitHub.com` and press enter

```sh
? What account do you want to log into?
> GitHub.com
  GitHub Enterprise Server
```

- Select `HTTPS` and press enter

```sh
? What is your preferred protocol for Git operations?
> HTTPS
  SSH
```

- Select `Yes` and press enter

```sh
? Authenticate Git with your GitHub credentials?
> Yes
  No
```

- Select `Login with a web browser` and follow the instructions
- You can use your personal GitHub account

```sh
? How would you like to authenticate GitHub CLI?
> Login with a web browser
  Paste an authentication token
```

#### 5. Setup ssh key

- Replace `your_email@example.com` with your GitHub email address.

```sh
ssh-keygen -t ed25519 -C "your_email@example.com"
```

- Leave the filename blank

```sh
> Enter a file in which to save the key (/Users/YOU/.ssh/id_ed25519): [Press enter]
```

- Enter same passphrase twice

```sh
> Enter passphrase (empty for no passphrase): [Type a passphrase]
> Enter same passphrase again: [Type passphrase again]
```

- Add ssh key to ssh-agent

```sh
echo "\
Host HOSTNAME\n\
  AddKeysToAgent yes\n\
  UseKeychain yes\n\
  IdentityFile ~/.ssh/id_ed25519\
" > ~/.ssh/config &&

ssh-add --apple-use-keychain ~/.ssh/id_ed25519
```

- Add ssh key to GitHub

```sh
gh ssh-key add ~/.ssh/id_ed25519.pub
```

- Go to [GitHub SSH and GPG keys settings](https://github.com/settings/keys), Click `Configure SSO` button and Authorize for both `fortmatic` and `magiclabs` organizations and follow the instructions

![](https://bafkreietksslw7f54oa6oj6nhvxdhejqheaw7gltgre33quxjdaojtsgzi.ipfs.dweb.link/)

#### 5. Install and configure the CLI

First, we need to setup the CLI on our local machine:

1. Install globally: `pnpm add -g vercel` (alternative: use `npx` to run vercel commands)
2. Ensure it was installed correctly: `vercel --version`
3. Login: `vercel login`
4. This will take you into the browser to authenticate with your Vercel account
5. Back in your terminal, verify with `vercel whoami`
6. Switch to our team: `vercel switch magiclabs`
7. Link your local mandrake to the project in Vercel: `vercel link`
8. It will run through a series of questions. Make sure to select "Magic Labs" as the scope and it should automatically find `magiclabs/magic-dashboard`. Just say yes from there.
9. You're all set!

#### 6. Go to localhost:3015

- You should see the magic-dashboard login page

![](https://bafybeicbfztetvf4p2qbsdcvjfto7vgkfchjzhkesyda2aajcf2orbyrne.ipfs.dweb.link/)

- Login with your `@magic.link` email address and start developing! 🥳

- If you cannot login with your email, then use alias

- e.g. `abcd@magic.link` -> `abcd+1@magic.link`

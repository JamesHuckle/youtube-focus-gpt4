## Getting Started

Is deployed on Vercel to serve the backend (https://vercel.com/jameshuckle/youtube-focus-gpt4)

The Chrome extension is "load unpacked" pointing to the /out folder (see build scripts) for quick running, but the /packages .zip file can be uploaded to the Chrome store (see build scripts)

### Tips

**Install node 21 (using nvm)**

* `curl https://raw.githubusercontent.com/creationix/nvm/master/install.sh | bash`
* `source ~/.bashrc`
* `nvm install node 21`

**Download all packages**

* `npm install`

**Set gsed to use sed (Mac uses gsed, Ubuntu uses sed)**

* `sudo ln -s /bin/sed /bin/gsed`

**Install zip**

- `sudo apt install zip`

**Install node-watch**

* `npm install -g node-watch`

**Make `packages/` directory for zip export (to allow uploading to Chrome store, not needed otherwise)**

* `mkdir packages`

### Running build scripts

```
# package.json contains scripts

# Run app locally
npm run dev

# Build extension in /out folder
npm run build:extension

# Export .zip file for uploading to Chrome store in /packages folder
npm run package

```

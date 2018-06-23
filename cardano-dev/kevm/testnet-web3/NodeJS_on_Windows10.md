# NodeJs on a Windows10 system

This is a short step-by-step guide on how to prepare a Windows 10 computer to execute the Javascript examples in this repository.

## 1.) install GIT

If not already done, download it from https://git-scm.com/download/win and install it with all default settings.

Optionally download and install Notepad++ (TextEditor) and select it during GIT setup as your default editor.

After GIT setup completed you will see the git console. You can close it for now.

## 2.) install NodeJS

Now download and install https://nodejs.org/en/download/ 

Install it with all default settings.

## 3.) update NPM and install some tools

NodeJS contains also npm, the packet manager you will going to use to download and maintain all required packages in the scripts.

Open a command line console with administrative privileges and run 

```
npm i npm@latest -g
```

Then install the windows build tools (basically Python v2.7)

```
npm install --global --production windows-build-tools
```

Then install the GYP 

```
npm install --global node-gyp
```

Then we need to add python to the environment variables

```
setx PYTHON "%USERPROFILE%\.windows-build-tools\python27\python.exe"
```

now close this command line console.

## 5.) install Visual Studio

Download and install the latest Visual Studio Community Edition (currently 2017) https://www.visualstudio.com/en-us/downloads/download-visual-studio-vs.aspx

On the initial screen (Workloads) I suggest selecting both Windows > Universal and Web & Cloud > NodeJS 

If you don't want 16 Gigabytes of diskspace used by this installation you may select only NodeJS as workload (2.8 GB disk space)

You can create an account or skip it for now, select your preferred GUI design, and then simply close Visual Studio

## 6.) install required packages

the test scripts require certain packages installed with npm.

Re-open (really! you need to close the console you used to install step1-4) a command line console and execute all npm install commands. 

The basic example script requires this packages installed

```
npm install web3
npm install crypto
npm install solc
npm install request-promise-native
npm install log4js
npm install nconf
```

## 7.) run the Cardano testnet example script

now navigate to the folder where you have downloaded or git-cloned the testnet example scripts and run

```
node [scriptname].js
```


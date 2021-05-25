#!/usr/bin/env node

const { Octokit } = require("octokit");
const { createOAuthDeviceAuth } = require("@octokit/auth-oauth-device");
const {
  createOrUpdateTextFile,
} = require("@octokit/plugin-create-or-update-text-file");

const { bumpBoopCounter } = require("./lib/bump-boop-counter.js");

const owner = "gr2m";
const repo = "boop-gregors-nose";

// register plugin and set default for user agent
const MyOctokit = Octokit.plugin(createOrUpdateTextFile).defaults({
  userAgent: "gregors-nose-booper",
});

run();

async function run() {
  // instantiate `octokit` with the OAuth Device authentication strategy and
  // credentials for an OAuth app
  const octokit = new MyOctokit({
    authStrategy: createOAuthDeviceAuth,
    auth: {
      clientType: "github-app",
      // Client ID for https://github.com/apps/gregor-s-nose-booper
      clientId: "Iv1.9b0bb6178e20d3f4",
      scopes: ["public_repo"],
      onVerification(verification) {
        // verification example
        // {
        //   device_code: "3584d83530557fdd1f46af8289938c8ef79f9dc5",
        //   user_code: "WDJB-MJHT",
        //   verification_uri: "https://github.com/login/device",
        //   expires_in: 900,
        //   interval: 5,
        // };

        console.log("Open %s", verification.verification_uri);
        console.log("Enter code: %s", verification.user_code);
      },
    },
    // auth: process.env.GITHUB_TOKEN,
  });

  try {
    // try to update the README directly.
    await octokit.createOrUpdateTextFile({
      owner,
      repo,
      path: "README.md",
      message: "BOOP",
      content: ({ content }) => {
        return bumpBoopCounter(content);
      },
    });

    console.log(`you done been booped`);
  } catch (error) {
    // if it fails, try to create an issue
    const { data: issue } = await octokit
      .request("POST /repos/{owner}/{repo}/issues", {
        owner,
        repo,
        title: "plz to boop",
        body: "I bestow upon you my finest of boops",
      })
      .catch((err) => {
        console.log(err);
      });

    console.log(`issue created at ${issue.html_url}`);
  }
}

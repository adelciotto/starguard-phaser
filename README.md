## starguard-phaser

This is a *incomplete*  recreation of [vacuum flowers Starguard](http://vacuumflowers.com/star_guard/).
This is not a port of the game, this is not code conversion. This is an experimental demo, written from scratch, recreating of one of my favorite flash games using HTML5 technologies in the browser.
While I will try my hardest to preserve the spirit of the game, I am for now simply using it as a testbed for a university class on cloud computing, so expect many features to be missing.

This project is in no way endorsed by [vacuum flowers](http://vacuumflowers.com/weblog/). Most images, logos, characters, dialog,
plot, and other assets taken from the original Starguard are copyrights of vacuum flowers; I claim no ownership of
any of the assets taken from the original game.

This game is built with [Phaser](http://phaser.io) and AWS [Elastic Beanstalk](http://aws.amazon.com/documentation/elastic-beanstalk/) to host the game.

### Running the Game

The current state of the game is highly in flux, but you can always run the current state of master by installing
[Node.js](http://nodejs.org)

Then run the following:

```shell
git clone https://github.com/adelciotto/starguard-phaser.git
cd starguard-phaser
npm install && npm run dev
```

Then point your browser to [http://localhost:3000](http://localhost:3000).

### Preview

![preview](http://imgur.com/MoWx4Ha.png)

![title screen](http://imgur.com/JX0mScn.gif)

![multiplayer](http://imgur.com/ltIICF3.gif)

### License and Legal

This code-base is released under the [MIT License](http://opensource.org/licenses/MIT).

All dependencies are released under their own respective licenses.

Most images, logos, characters, dialog, plot, and other assets taken from the original Starguard
are copyrights of [vacuum flowers](http://vacuumflowers.com/weblog/); I claim no ownership of any of the assets taken from the original game.

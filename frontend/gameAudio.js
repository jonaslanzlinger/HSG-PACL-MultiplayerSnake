class GameAudio {

   sliderMusic = document.getElementById('slider-music');
   sliderFx = document.getElementById('slider-fx');

   #music
   #gameOver
   #appleSoundList = []
   #pickup
   #inverser
   #star
   #obstacle
   #immune
   #inventoryError
   #snakeEater
   #fxList

   constructor() {

      // Loading all sounds

      this.#music = new Audio()
      this.#music.src = '/assets/sounds/music.wav'
      this.#music.loop = true;

      this.#gameOver = new Audio()
      this.#gameOver.src = '/assets/sounds/gameOver.m4a'
      this.#fxList = [this.#gameOver];

      let appleSoundPaths = [
         '/assets/sounds/apple/apple1.m4a',
         '/assets/sounds/apple/apple2.m4a',
         '/assets/sounds/apple/apple3.m4a',
         '/assets/sounds/apple/apple4.m4a',
         '/assets/sounds/apple/apple5.m4a',
         '/assets/sounds/apple/apple6.m4a',
      ];
      appleSoundPaths.forEach((path) => {
         let audio = new Audio()
         audio.src = path;
         this.#appleSoundList.push(audio);
         this.#fxList.push(audio);
      });

      this.#pickup = new Audio()
      this.#pickup.src = '/assets/sounds/pickup.m4a'
      this.#fxList.push(this.#pickup);

      this.#inverser = new Audio()
      this.#inverser.src = '/assets/sounds/inverser.m4a'
      this.#fxList.push(this.#inverser);

      this.#star = new Audio()
      this.#star.src = '/assets/sounds/star.m4a'
      this.#fxList.push(this.#star);

      this.#obstacle = new Audio()
      this.#obstacle.src = '/assets/sounds/obstacle.m4a'
      this.#fxList.push(this.#obstacle);

      this.#immune = new Audio()
      this.#immune.src = '/assets/sounds/immune.m4a'
      this.#fxList.push(this.#immune);

      this.#inventoryError = new Audio()
      this.#inventoryError.src = '/assets/sounds/inventoryError.m4a'
      this.#fxList.push(this.#inventoryError);

      this.#snakeEater = new Audio()
      this.#snakeEater.src = '/assets/sounds/snakeEater.m4a'
      this.#fxList.push(this.#snakeEater);

      this.sliderMusic.addEventListener('input', () => {
         this.#music.volume = this.sliderMusic.value / 100;
      });

      this.sliderFx.addEventListener('input', () => {
         this.#fxList.forEach(fx => {
            fx.volume = this.sliderFx.value / 100;
         });
      });
   }

   playMusic() {
      this.#music.play();
   }

   stopMusic() {
      this.playObstacle();
      this.#music.pause();
      this.playGameOver();
   }

   playGameOver() {
      this.#gameOver.play();
   }

   playSoundByFieldType(fieldType, player) {
      switch (fieldType) {
         case 'a':
            this.playApple();
            break;
         case 'ps':
            this.playPickup();
            break;
         case 'pi':
            this.playPickup();
            break;
         case 'pe':
            this.playPickup();
            break;
         case 'o':
            if (player.activePowerUps.includes('ps'))
               this.playImmune();
            else
               this.playObstacle();
            break;
      }
   }

   playApple() {
      const index = Math.floor(Math.random() * this.#appleSoundList.length);
      this.#appleSoundList[index].currentTime = 0;
      this.#appleSoundList[index].play();
   }

   playPickup() {
      this.#pickup.currentTime = 0;
      this.#pickup.play();
   }

   playInverser() {
      this.#inverser.currentTime = 0;
      this.#inverser.play();
   }

   playStar() {
      this.#star.currentTime = 0;
      this.#star.play();
   }

   playObstacle() {
      this.#obstacle.currentTime = 0;
      this.#obstacle.play();
   }

   playImmune() {
      this.#immune.currentTime = 0;
      this.#immune.play();
   }

   playInventoryError() {
      this.#inventoryError.currentTime = 0;
      this.#inventoryError.play();
   }

   playSnakeEaterSound() {
      this.#snakeEater.currentTime = 0;
      this.#snakeEater.play();
   }

}
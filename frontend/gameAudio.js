class GameAudio {

   #music
   #appleSoundList = []
   #pickup
   #inverser
   #star
   #obstacle

   constructor() {

      // Loading all sounds

      this.#music = new Audio()
      this.#music.src = '/assets/sounds/music.wav'
      this.#music.loop = true;
      this.#music.volume = 0.5;

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
      });

      this.#pickup = new Audio()
      this.#pickup.src = '/assets/sounds/pickup.m4a'

      this.#inverser = new Audio()
      this.#inverser.src = '/assets/sounds/inverser.m4a'

      this.#star = new Audio()
      this.#star.src = '/assets/sounds/star.m4a'

      this.#obstacle = new Audio()
      this.#obstacle.src = '/assets/sounds/obstacle.m4a'
   }

   playMusic() {
      this.#music.play();
   }

   stopMusic() {
      this.#music.pause();
   }

   playSoundByFieldType(fieldType) {
      switch (fieldType) {
         case 'a':
            this.playAppleSound();
            break;
         case 'ps':
            this.playPickupSound();
            break;
         case 'pi':
            this.playPickupSound();
            break;
         case 'o':
            this.playObstacleSound();
            break;
      }
   }

   playAppleSound() {
      const index = Math.floor(Math.random() * this.#appleSoundList.length);
      this.#appleSoundList[index].play();
   }

   playPickupSound() {
      this.#pickup.play();
   }

   playInverserSound() {
      this.#inverser.play();
   }

   playStarSound() {
      this.#star.play();
   }

   playObstacleSound() {
      this.#obstacle.play();
   }
}
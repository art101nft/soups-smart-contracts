module.exports = async function main(callback) {
  try {
    const Bauhaus = artifacts.require("Bauhaus");
    const contract = await Bauhaus.deployed();
    const existingPrime = (await contract.randPrime()).toString();
    if (existingPrime == 0) {
      const randPrime = getRandomPrime();
      await contract.setRandPrime(randPrime);
      console.log(`Set contract randPrime value to ${randPrime}!`);
      callback(0);
    } else {
      console.log(`Contract randPrime value already set to ${existingPrime}.`);
      callback(1);
    }
  } catch (error) {
    console.error(error);
    callback(1);
  }
}

// Simple JS function to grab a random prime number
function getRandomPrime() {
  var numbers = [], primes = [], maxNumber = 10000;

  for(var i = 100; i <= maxNumber; i++){
    numbers.push(i);
  }

  while(numbers.length){
    primes.push(numbers.shift());
    numbers = numbers.filter(
      function(i){
        return i % primes[primes.length-1]!= 0
      }
    );
  }

  let randNum = Math.floor(Math.random() * primes.length);
  let randPrime = primes[randNum];

  return randPrime
}

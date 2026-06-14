let greet = function (name: string) {
  return `Hello ${name}`;
};
console.log(greet("Yousef"));

const originalGreet = greet;

greet = function (name: string) {
  console.log("before calling function");
  const result = originalGreet(name);
  console.log("after calling function");
  return result;
};

console.log(greet("Yousef"));

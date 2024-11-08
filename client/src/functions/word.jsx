const wordFunction = (arr1, arr2) => {
  let result = [];
  // 1 = TABIEN 2 = MEJOR 0 = TAMAL
  for (let i = 0; i < arr1.length; i++) {
    switch (true) {
      case arr1[i] == arr2[i]:
        result[i] = 1;
        break;
      case arr1.includes(arr2[i]):
        result[i] = 2;
        break;
      default:
        result[i] = 0;
        break;
    }
  }
  return result;
};

export default wordFunction;

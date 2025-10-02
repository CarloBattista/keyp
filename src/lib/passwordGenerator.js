export function generatePassword(options = {}) {
  const {
    length = 16,
    includeLowercase = true,
    includeUppercase = true,
    includeNumbers = true,
    includeSymbols = true,
    excludeAmbiguous = true,
    requireEach = true,
  } = options;

  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*_-+=?~.,;:';

  const ambiguous = 'O0oIl1|`\'"{}[]()<>/\\';

  let pools = [];
  if (includeLowercase) pools.push(lower);
  if (includeUppercase) pools.push(upper);
  if (includeNumbers) pools.push(numbers);
  if (includeSymbols) pools.push(symbols);

  if (pools.length === 0) {
    throw new Error('Nessun set di caratteri selezionato');
  }

  const sanitize = (str) =>
    excludeAmbiguous
      ? str
          .split('')
          .filter((c) => !ambiguous.includes(c))
          .join('')
      : str;

  pools = pools.map(sanitize);

  let all = pools.join('');
  if (!all.length) {
    throw new Error('Set di caratteri vuoto dopo esclusioni');
  }

  const pick = (set) => set[secureRandomIndex(set.length)];

  let result = [];

  if (requireEach) {
    for (const set of pools) {
      result.push(pick(set));
    }
  }

  while (result.length < length) {
    result.push(pick(all));
  }

  result = secureShuffle(result);

  return result.slice(0, length).join('');
}

function secureRandomIndex(max) {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return arr[0] % max;
}

function secureShuffle(array) {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = secureRandomIndex(i + 1);
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
}

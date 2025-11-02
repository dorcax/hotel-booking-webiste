export const makeFullText=<k extends string>(
    items:Partial<Record<k,string>> |any,
    updates:Partial<Record<k,string>> |any,
    ...keys:k[]
):string=>{

    // how to write regex 
//     / and / → start and end of regex.

// ' → matches a literal apostrophe character.

// g (global flag) → apply to all occurrences, not just the first one.

// '' → replace with nothing (delete it).
// second method 
// replace(/[\W_]+/g, ' ')

// This one replaces non-alphanumeric characters (and underscores) with a space.

// [...] → a character class (match any of these characters).

// \W → means non-word character (anything that’s not a-z, A-Z, 0-9, or _).

// _ → underscore added separately because \W considers underscore a “word character”, but you wanted to treat _ as junk too.

// + → “one or more times” (so !!! becomes just one space, not three).

// g → apply everywhere.

// ' ' → replace with a single space.

const joined =keys.map((k)=>updates?.[k] ??items?.[k]??"").join(" ")
.toLowerCase()
.replace(/'/g,' ').replace(/[\W_+]/g," ")
return joined.replace(/\b(\w+)/g,"x$1")
//  return joined.replace(/\b(\w+)/g, 'x$1');



}

// search query 
export function searchQuery(text:string) {
  if (!text?.trim()) return '';

  return text
    .toLowerCase()
    .replace(/'/g, '') // remove apostrophes
    .split('|')        // support OR search
    .map((phrase) =>
      phrase
        .replace(/[\W_]+/g, ' ')
        .trim()
        .split(/\s+/) // split on any space(s)
        .filter((w) => w.length > 1)
        .map((w) => `x${w}:*`) // x + prefix search
        .join(' & ')
    )
    .filter(Boolean)
    .map((p) => `(${p})`)
    .join(' | ');
}
midwestJSD3
===========

The code example for the D3.js MidwestJS presentation

To get this to work for yourself

1. Sign up for http://developer.marvel.com/ . Get a Marvel API key and put it in your main.js file. 

2. In your Marvel developer account (https://developer.marvel.com/account) set your domain (probably localhost at first). You will not need to use the secret key because you are telling Marvel to expect requests from your domain.

3. If you want to use the interactive API documentation, be sure to add marvel to a the list of expected domains.


One thing with usage - there are two ways to find characters, both by exact match and by starts with. Most popular characters have a few derivatives, so I couldn't do a starts with search without having some sort of "Select which character you mean" thing and I didn't want to spend time messing with that. Maybe you do? 
VisioCatch
==============
Une application simple de récupération de données ophtalmiques.

VisioCatch à pour simple but la récupération de données provenant d'équipements ophtalmique ou orthoptique, de traiter ses données afin de les copier simplement et avec une certaine structure.

Pas de gestion de patient, ni de stockage des données n'est prévu pour cette application.

# Télécharger l'application

L'application n'est buildé que pour windows, et je le fait en 32 bits pour les problèmes de compatibilités d'installation sur des OS en 32 bits seulement.
N'ayant pas encore trouvé de solution pour faire des builds 32/64.

Vous pouvez télécharger l'application ici [visioCatch](https://github.com/Renouveaux/visioCatch/blob/master/releases/visiocatch_0.1.0.exe).
Pour partir sur de bonnes bases, si vous avez déjà installé une version précédente, désinstallez là, puis supprimer le dossier **visioCatch** présent dans le répertoire `c:\ProgramData\`


# Développer l'application
Pour le développement de l'application, il est nécessaire d'avoir [Node.js](https://nodejs.org), mais aussi visual studio express web 2013 pour la compilation du module **serialPort**.
**Gulp** doit aussi être installé en global
Première partie d'installation
```
git clone https://github.com/Renouveaux/visioCatch.git
cd visioCatch
npm install
npm install -g gulp
```
A partir de là, l'application n'est pas complètement installée. La partie la plus dure est l'installation de serial port. Pour ce faire, il faut ce rendre dans le dossier **app**, installer **serialport**, récupérer le nom du dossier de compilation. Utiliser **electron-rebuilt**, puis remodifier le nom du dossier de compilation de **serialport**.
Compliqué tous cela.
```
cd app
npm install serialport
```
Une fois finit, se rendre dans l’explorer au chemin suivant :  **app/node_modules/serialport/build/Release**
Dans ce répertoire, n'est présent qu'un seul dossier dont le nom contient node-vxx-win-arch. Il faut copier le nom de ce dossier pour le rappliquer par la suite. 
on reprend dans la console ***Toujours depuis le dossier app***
```
$ node_modules\.bin\electron-rebuild.cmd .
```
La compilation des différents modules se lance exclusivement pour l'utilisation avec electron.
Une fois la compilation terminée, il vous faut retourner dans le dossier **Release** afin de renommer le dossier avec le nom précédemment copié.

L'application est maintenant prêt pour utilisation. On reviens à la racine de cette dernière, puis on lance la commande start.
```
cd ../
npm start
```

# Packager l'application
Les icons de l'application sont présentes dans le dossier `ressources`. Ces icons sont utilisées pour l'installeur ainsi que pour l'application elle même.

Pour packager l'application, la commande suivante suffira:
```
npm run release
```
Cela va empaqueter l'application, le résultat se trouvera dans le dossier `release`, et builder selon l'OS sur lequel vous vous trouver.
L'application n'est tester que sur windows.


## Windows

#### Installer

L'installaleur utilise l'outils [NSIS](http://nsis.sourceforge.net), pour la création du setup. Vous devrez donc installer la version 3.0 de NSIS et ajouter son dossier au PATH de votre système afin que la commande release fonctionne. `C:\Program Files (x86)\NSIS`.

#### 32-bit build on 64-bit Windows

Pour la génération d'une application spécifique 32 bits, il vous faudra spécifier à node l'architecture du système que vous souhaitez.
Une fois cela fait, vous devrez réinstaller tous les modules si vous l'aviez déjà fait, afin que node charge les packages en 32 bits, mais aussi que serialport soit compiler en 32 bits.
```
SET npm_config_arch=ia32
rmdir /S node_modules
npm install
```

# License

The ISC License (ISC)

Copyright (c) 2015 Renouveaux

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION
OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN
CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
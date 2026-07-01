<?php

return [

    'accepted'             => 'Le champ :attribute doit être accepté.',
    'email'                => 'Le champ :attribute doit être une adresse email valide.',
    'max'                  => [
        'string' => 'Le champ :attribute ne peut pas dépasser :max caractères.',
    ],
    'min'                  => [
        'string' => 'Le champ :attribute doit contenir au moins :min caractères.',
    ],
    'required'             => 'Le champ :attribute est obligatoire.',
    'same'                 => 'Les champs :attribute et :other doivent être identiques.',
    'size'                 => [
        'string' => 'Le champ :attribute doit contenir exactement :size caractères.',
    ],
    'string'               => 'Le champ :attribute doit être une chaîne de caractères.',
    'unique'               => 'Cette valeur est déjà utilisée pour le champ :attribute.',
    'confirmed'            => 'La confirmation du champ :attribute ne correspond pas.',
    'regex'                => 'Le format du champ :attribute est invalide.',

    'password' => [
        'letters'       => 'Le :attribute doit contenir au moins une lettre.',
        'mixed'         => 'Le :attribute doit contenir au moins une majuscule et une minuscule.',
        'numbers'       => 'Le :attribute doit contenir au moins un chiffre.',
        'symbols'       => 'Le :attribute doit contenir au moins un caractère spécial.',
        'uncompromised' => 'Ce :attribute est apparu dans une fuite de données. Veuillez en choisir un autre.',
    ],

    'attributes' => [
        'password' => 'mot de passe',
        'email'    => 'adresse email',
    ],

];

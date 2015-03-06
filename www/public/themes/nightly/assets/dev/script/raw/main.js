$(document).ready(function() {
    function getRandomElement(array) {
        randomIndex = Math.floor(Math.random() * array.length)
        return array[randomIndex];
    }

    slogan = [
        'Where all the geeks come together.',
        'Night Login, never logout!',
        'Hack, buld, analyze, code.',
        'We build... stuff... with tech!',
        'Ketika kode gak jalan-jalan #disituKadangSayaMerasa_sedih',
        'Special contribution for Night Login Web Community!'

    ];

    $('#slogan').html(getRandomElement(slogan));

    $('#slogan').on('click', function() {
        $(this).fadeOut(200, function() {
            $(this).html(getRandomElement(slogan)).fadeIn(200);
        })
    });
})
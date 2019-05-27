
export const DEFINITION = {
    /*
    * viewName: [<Nombre del tema en inglés>, <Nombre del tema es español>],
    * font: Fuente principal del tema (tiene que ser de Google Fonts),
    * background: [
    *   Insertar colores o url a las imágenes del tema. Por ejemplo: 'url(/themes/orange/background_images/orange0.jpg)',...
    * ],
    * colors: {
    *   themeColor1: color principal del tema,
    *   themeColor2:
    *   themeColor3:
    *   themeColor4:
    *   themeColor5:
    * },
    * images: {
    *   template1: { left: '' },
    *   template3: { topLeft: 'topLeft.png', topRight: 'topRight.png', bottomLeft: 'bottomLeft.png', bottomRight: 'bottomRight.png' },
    *   template7: { left: '' },
    * }
    * */
    viewName: ['ETSIT', 'ETSIT'],
    font: 'Libre Franklin',
    background: {
        f16_9: [
            'url(/themes/etsit/background_images/etsit_169.jpg)',
        ],
        f4_3: [
            'url(/themes/etsit/background_images/etsit_43.jpg)',
        ],
    },
    colors: {
        themeColor1: '#F18E00',
        themeColor2: '#C4C4C4',
        themeColor3: '#004489',
        themeColor4: '#FFCD5E',
        themeColor5: '#434343',
        themeColor6: '#004489',
    },
    images: {
        template1: { left: 'left.jpg' },
        template3: { topLeft: 'topLeft.jpg', topRight: 'topRight.jpg', bottomLeft: 'bottomLeft.jpg', bottomRight: 'bottomRight.jpg' },
        template7: { left: 'seven.jpg' },
    },
};
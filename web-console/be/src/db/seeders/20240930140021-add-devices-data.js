'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */

    const t = await queryInterface.sequelize.transaction();
    try {

      await queryInterface.bulkInsert('device_model_group', [
        {
          id: 1,
          title: 'Default Group',
          description: 'Default group for devices, if no group is specified',
          link_image: 'https://m.media-amazon.com/images/I/61lgoKLm6KL._AC_UF1000,1000_QL80_.jpg',
        },
        {
          id: 2,
          title: 'Group 2',
          description: 'Maecenas ut efficitur orci. Donec mattis velit nisi, quis sodales nisl posuere at. Pellentesque rhoncus, dolor ac ornare auctor, purus tortor semper felis, a posuere sapien risus sed augue. Ut et faucibus sapien. Phasellus ultricies maximus felis a venenatis. Ut id nibh nulla. Suspendisse fringilla pretium felis, quis tristique lorem tincidunt sit amet. Ut sit amet libero ac massa volutpat posuere sit amet et lorem. Phasellus ut odio metus. Suspendisse cursus in massa at dignissim. Maecenas sed feugiat ligula. In facilisis arcu sed purus pretium, vitae laoreet lorem suscipit.',
          link_image: 'https://imgur.com/l8yZpoD',
        },
        {
          id: 3,
          title: 'Group 1',
          description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur ultricies iaculis scelerisque. Sed id arcu ac dui blandit pulvinar. Fusce leo libero, egestas at efficitur at, mattis quis diam. Aenean blandit, dolor eu feugiat mollis, quam erat tempus magna, vel pulvinar erat dui aliquam nunc. Ut tristique felis magna, nec tristique velit fringilla vitae. Nunc rutrum dignissim imperdiet. Phasellus quis est non mauris consequat lobortis. Aliquam velit lorem, bibendum in quam id, pharetra cursus ligula. Fusce varius purus nec cursus egestas. ',
          link_image: 'https://i.pinimg.com/736x/ef/8d/59/ef8d595cf44d8b09c1c7a74266e4ea75.jpg',
        },
      ], { transaction: t });

      await queryInterface.bulkInsert('device_model', [
        {
          id: 1,
          device_group_id: 1,
          name: 'Placeholder device model',
          description: 'This is a placeholder device model, used when no model is specified, no specific data is available for this model, and it is only meant to be used as a placeholder before a real device model is created.',
          // serial: '007114173493',
          // link_image: 'https://placehold.co/600x400/ffffbb/000000/png',
          // link_datasheet: 'https://www.example.com/datasheet1.pdf',
          // link_userguide: 'https://www.example.com/userguide1.pdf',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 2,
          device_group_id: 2,
          name: 'Modello 2',
          description: 'Donec nisl erat, rhoncus quis quam nec, mattis fermentum arcu. Sed facilisis in arcu eget cursus. Nullam non posuere sem. Fusce porttitor, sem tristique viverra aliquet, dolor nibh volutpat sapien, eget vestibulum urna lacus ac est. Morbi sed viverra ex, sit amet lobortis ligula. ',
          // serial: '123997757716',
          // link_image: 'https://placehold.co/500x500/ffbbff/000000/png',
          // link_datasheet: 'https://www.example.com/datasheet2.pdf',
          // link_userguide: 'https://www.example.com/userguide2.pdf',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 3,
          device_group_id: 2,
          name: 'Modello 3',
          description: 'Sed at posuere felis, sit amet sollicitudin sem. Ut finibus pharetra dui sit amet euismod. Sed pellentesque mauris in lacus auctor, ut maximus enim pellentesque. Integer faucibus dui ac placerat commodo. ',
          // serial: '8810056391',
          // link_image: 'https://placehold.co/500x600/ffbbbb/000000/png',
          // link_datasheet: 'https://www.example.com/datasheet3.pdf',
          // link_userguide: 'https://www.example.com/userguide3.pdf',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 4,
          device_group_id: 3,
          name: 'Modello 1',
          description: '"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas egestas sed felis eu blandit. Nullam maximus id arcu malesuada ultricies. In varius odio ac tempus condimentum. "',
          // serial: '007114173493',
          // link_image: 'https://placehold.co/600x400/ffffbb/000000/png',
          // link_datasheet: 'https://www.example.com/datasheet1.pdf',
          // link_userguide: 'https://www.example.com/userguide1.pdf',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ], { transaction: t });


      await queryInterface.bulkInsert('device', [
        {
          id: 1,
          device_model_id: 4,
          din_id: 1,
          name: 'Root Device',
          serial: '007114173493',
          latitude: 39.3017,
          longitude: 16.2537,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 2,
          device_model_id: 2,
          din_id: 2,
          name: 'Example Device 1',
          serial: '123997757716',
          latitude: 39.2854,
          longitude: 16.2619,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 3,
          device_model_id: 3,
          din_id: 3,
          name: 'Example Device 2',
          serial: '123997757716',
          latitude: 39.2854,
          longitude: 16.2619,
          created_at: new Date(),
          updated_at: new Date(),
        }
      ], { transaction: t });
      await t.commit();
    }
    catch (err) {
      console.error(err);
      await t.rollback();
      throw err;
    }
  },

  async down(queryInterface, Sequelize) {
    const t = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.bulkDelete('device', null, { transaction: t });
      await queryInterface.bulkDelete('device_model', null, { transaction: t });
      await queryInterface.bulkDelete('device_model_group', null, { transaction: t });
      await t.commit();
    }
    catch (err) {
      await t.rollback();
      throw err;
    }
  }
};

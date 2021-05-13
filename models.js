const { Sequelize, Model, DataTypes } = require('sequelize');
const sequelize = new Sequelize(process.env.DB_DB, process.env.DB_USER, process.env.DB_PASS, {
    host: 'localhost',
    dialect: 'mysql'
});

const UslugiGroups = sequelize.define('UslugiGroups', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    images: DataTypes.STRING,
    mimeType: DataTypes.STRING,
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
})
const Work = sequelize.define('Work', {
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
    mimeType: DataTypes.STRING,
    img: DataTypes.STRING,
    images: DataTypes.JSON,
    srok: DataTypes.STRING,
    sizes: DataTypes.STRING,
    square: DataTypes.STRING,
    cost: DataTypes.STRING,
  
})

const UslugaWork = sequelize.define('UslugaWork', {
    label: DataTypes.STRING,
    cost: DataTypes.STRING,
  
})

const Usluga = sequelize.define('Usluga', {
 
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: DataTypes.STRING,
    mimeType: DataTypes.STRING,
    images: DataTypes.STRING,
    description: DataTypes.TEXT,
    maxS: DataTypes.STRING,
    minPrice: DataTypes.STRING,
})



const indexPage = sequelize.define('indexPage', {
    pageTitle: DataTypes.STRING,
    heroText: DataTypes.TEXT,
    uslugiText: DataTypes.TEXT,
    worksText: DataTypes.TEXT,
    purposeText: DataTypes.TEXT,
    stagesText: DataTypes.TEXT,
    active: DataTypes.BOOLEAN
})

sequelize.sync({alter: true})

    sequelize.authenticate().then(r => {
        console.log('Connection has been established successfully.');
    }).catch(error => {
    console.error('Unable to connect to the database:', error);
  })

UslugiGroups.hasMany(Usluga, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
})

Usluga.belongsTo(UslugiGroups)
Usluga.hasMany(UslugaWork, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
})
Usluga.hasMany(Work, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
})

UslugaWork.belongsTo(Usluga)
Work.belongsTo(Usluga)


module.exports.UslugiGroups = UslugiGroups
module.exports.indexPage = indexPage 
module.exports.Usluga = Usluga 
module.exports.UslugaWork = UslugaWork
module.exports.Work = Work 

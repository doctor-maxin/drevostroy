const AdminBro = require('admin-bro')
const AdminBroExpress = require('@admin-bro/express')
const AdminBroSequelize = require('@admin-bro/sequelize')
const uploadFeature = require('@admin-bro/upload')
AdminBro.registerAdapter(AdminBroSequelize)
const { BaseProvider } = require('@admin-bro/upload')
const fs = require('fs-extra')
const path = require('path')
const nodemailer = require('nodemailer');
const db = require('./models');
const express = require('express')
const app = express()
const bodyParser = require('body-parser')


class CustomProvider extends BaseProvider {
    constructor() {
        super('uploads');
    }
    async upload(file, key, ctx) {
        try {
            console.log(file)
            console.log(key)

            await fs.ensureFile(file.path)
            console.log("tmp file exist")
            await fs.ensureDir(path.join(__dirname, this.bucket))
            console.log("dir is exist")
            await fs.move(file.path, path.join(__dirname, this.path(key, file.bucket || '')), {overwrite: true})
        } catch (e) {
            console.log(file)
            console.log(e)
        }
    }
    async delete(key, bucket) {
        await fs.remove(this.path(key, bucket))
    }
    path(key, bucket) {
        return `/${path.join(bucket ||'uploads', key)}`;
    }
}
let provider = new CustomProvider()

const adminBro = new AdminBro({
  databases: [],
  rootPath: '/admin',
  branding: {
    companyName: 'Amazing c.o.',
  },
  resources: [{
      resource: db.UslugiGroups,
      options: {
            properties: {
                images: {
                    isVisible: false
                },
                mimeType: {
                    isVisible: false
                },
                description: {
                    type: 'richtext'
                }
            }
      },
      features: [uploadFeature({
        provider,
        properties: { 
            key: 'images',
            mimeType: 'mimeType'
        }, uploadPath: (record, filename) => (
            `${filename}`
          ),
      })]
  }, {
    resource: db.Usluga,
    options: {
          properties: {
              images: {
                  isVisible: false
              },
              mimeType: {
                  isVisible: false
              },
              description: {
                  type: 'richtext'
              }
          }
    },
    features: [uploadFeature({
      provider,
      properties: { 
          key: 'images',
          mimeType: 'mimeType'
      }, uploadPath: (record, filename) => (
          `${filename}`
        ),
    })]
}, {
    resource: db.Work,
    options: {
          properties: {
              images: {
                  isVisible: false
              },
              img: {
                isVisible: false
              },
              mimeType: {
                  isVisible: false
              },
              description: {
                  type: 'richtext'
              }
          }
    },
    features: [uploadFeature({
      provider,
      multiple: true,
      properties: { 
        file: `images.file`,
        filePath: `images.filePath`,
        filesToDelete: `images.filesToDelete`,    
        key: `images.key`,
        mimeType: `images.mime`,
        bucket: `images.bucket`,
        size: `images.size`,
      }, uploadPath: (record, filename) => (
          `${Date.now()}-${filename}`
        ),
    }),uploadFeature({
        provider,
        properties: { 
            key: 'img',
            mimeType: 'mimeType'
        }, uploadPath: (record, filename) => (
            `${Date.now()}-${filename}`
          ),
      })]
},{
    resource: db.UslugaWork,
},{
    resource: db.indexPage ,
    options: {
        properties: {
            heroText: {type: 'richtext'},
            uslugiText: {type: 'richtext'},
            worksText: {type: 'richtext'},
            purposeText: {type: 'richtext'},
            stagesText: {type: 'richtext'},
        }
    }
  }]
})

const router = AdminBroExpress.buildRouter(adminBro)

app.get('/', async (req, res) => {
    let s = await db.UslugiGroups.findAll().then(sensors => {
        return sensors.map(sensor => {return sensor.toJSON()})
    })
    let config = await db.indexPage.findOne({where: {
        active: true
    }})
    const uslugi = await db.Usluga.findAll().then(sensors => {
        return sensors.map(sensor => {return sensor.toJSON()})
    })
    const works = await db.Work.findAll({
        limit: 3
    }).then(sensors => {
        return sensors.map(sensor => {return sensor.toJSON()})
    })
    
    console.log(s)
    res.render('index', {uslGr: s, works: works, uslugi: uslugi, usl: {}, config: config})
})

app.get('/group/:id', async (req, res) => {
    let s = await db.UslugiGroups.findByPk(req.params.id, {
        include: db.Usluga
    })
    
    res.render('group', {uslGr: s, config: {pageTitle: s.name}})
})

app.get('/usluga/:id', async (req, res) => {
    let usl = await db.Usluga.findByPk(req.params.id, {
        include: [db.UslugiGroups, db.UslugaWork, db.Work] 
    })
    const uslugi = await db.Usluga.findAll().then(sensors => {
        return sensors.map(sensor => {return sensor.toJSON()})
    })
    
    res.render('usluga', {usl: usl, uslugi: uslugi, config: {pageTitle: usl.name}})
})

app.get('/works', async (req, res) => {
    let works = await db.Work.findAll().then(sensors => {
        return sensors.map(sensor => {return sensor.toJSON()})
    })
    
    res.render('works', {Works: works, config: {pageTitle: 'Галерея работ'}})
})

app.get('/work/:id', async (req, res) => {
    let s = await db.UslugiGroups.findByPk(req.params.id)
    
    console.log(s)
    res.render('group', {uslGr: s, config: {pageTitle: s.name}})
})
app.set('view engine', 'ejs')
app.get('/uploads')
app.use('/uploads', express.static('uploads'));
app.use('/assets', express.static('assets'))
app.use('/dist', express.static('dist'))
app.use(bodyParser.json())
app.post('/book', async (req, res) => {
    console.log(req.body)
    let transporter = nodemailer.createTransport({
        host: 'smtp.xn----ctbfewe2abmfkm2l.xn--p1ai',
        secure: true,
        auth: {
            user: 'support@xn----ctbfewe2abmfkm2l.xn--p1ai',
            pass: 'Hollywood75@'
        }
    })
    let html = ``;
    if (!req.body.service) html +=`
        Клиент ${req.body.name} попросил обратный звонок на номер ${req.body.tel} в ${new Date().toDateString()}
    `; else html += `
        Клиент ${req.body.name} запросил услугу ${req.body.service} на номер ${req.body.tel} в ${new Date().toDateString()}
    ` 
    let result = await transporter.sendMail({
        from: '"ДревЭкоСтрой" support@древэко-строй.рф',
        to: 'doctor-maxin@yandex.ru',
        subject: 'Новый заказ!',
        html: html
      })
      res.json(result)
})

app.use(adminBro.options.rootPath, router)
app.listen(8080, () => console.log('AdminBro is under localhost:8080/admin'))
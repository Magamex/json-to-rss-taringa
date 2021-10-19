// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
const axios = require('axios');
const RSS = require('rss');

const get_post = async(usuario,cantidad=5)=>{
  try {
    const url_story = `https://api-user.taringa.net/user/${usuario}/feed?count=${cantidad}&withTips=true&filter=article&sharedBy=false`;
    const post_res = await axios.get(url_story);
    return post_res.data.items;
  }catch(err){
    return 404
  }
}

export default async function handler(req, res) {
  if(req.query.user == undefined){
    return res.status(404).send('No se encontro el parametro user');
  }

  const json_post = await get_post(req.query.user,req.query.count)

  if(json_post == 404 || json_post.length == 0){
    return res.status(404).send('No se encontro el usuario o  no tiene contenido');
  }

  let blog = {
    title: "Articulos creados en Taringa",
    description: "Post tomados directamente desde el perfil del usuario",
    author: req.query.user,
    articles: []
  }

  json_post.map((post)=>{
    blog.articles.push({
      title:post.title,
      description:post.summary.excerpt,
      url:`https://www.taringa.net/+${post.channel.name}/${post.slug}`,
      publishedDate: post.created
    })
  })

  const feed = new RSS({
    title:blog.title,
    description:blog.description,
    author: blog.author
  })

  blog.articles.map((article)=>{
    feed.item({
      title: article.title,
      description: article.description,
      url:article.url,
      date:article.publishedDate
    })
  })

  const xml = feed.xml({indent: true})

  res.status(200).send(xml)
}

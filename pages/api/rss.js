// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
const axios = require('axios');
const RSS = require('rss');

const get_post = async(usuario)=>{
  const url_story = `https://api-user.taringa.net/user/${usuario}/feed?count=5&withTips=true&filter=article&sharedBy=false`;
  const post_res = await axios.get(url_story);
  return post_res.data.items;
}

export default async function handler(req, res) {
  const json_post = await get_post(req.query.user)

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

  console.log(blog)

  res.status(200).send(xml)
}

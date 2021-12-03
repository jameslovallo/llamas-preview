import Head from 'next/head'
import { useEffect, useState } from 'react'
import AppBar from '../llamas/src/components/AppBar.jsx'
import AppDrawer from '../llamas/src/components/AppDrawer.jsx'
import Component from '../llamas/src/components/Component.jsx'
import Theme from '../llamas/src/components/Theme.jsx'

export default function Preview() {
	const [global, setGlobal] = useState({})
	const [page, setPage] = useState({})

	useEffect(async () => {
		document.querySelector('body').classList.add('preview')

		const urlParams = new URLSearchParams(window.location.search)
		const key = urlParams.get('token') || 'BZX4R4Dr8Y6rnegRb9YaPwtt'
		let path = urlParams.get('path') || 'home'
		path = path === 'settings' ? 'home' : path

		async function getContent() {
			const cacheBuster = new Date().getMilliseconds()
			await fetch(
				`https://api.storyblok.com/v2/cdn/stories/settings?token=${key}&version=draft&cv=${cacheBuster}`
			)
				.then((res) => res.json())
				.then((result) => setGlobal(result.story.content))

			await fetch(
				`https://api.storyblok.com/v2/cdn/stories/${path}?token=${key}&version=draft&cv=${cacheBuster}`
			)
				.then((res) => res.json())
				.then((result) => setPage(result.story.content.body))
		}

		getContent()

		const bridgeTag = document.createElement('script')
		bridgeTag.src = 'https://app.storyblok.com/f/storyblok-v2-latest.js'
		document.body.appendChild(bridgeTag)

		bridgeTag.addEventListener('load', () => {
			const storyblokInstance = new StoryblokBridge({
				preventClicks: true,
			})
			storyblokInstance.on('input', (payload) => {
				let { story } = payload
				if (story?.content && story.name === 'Settings') {
					setGlobal(story.content)
				} else if (story?.content?.body) {
					setPage(story.content.body)
				}
			})
		})
	}, [])

	return (
		<>
			{global._uid && (
				<>
					<Theme global={global} />
					<Head>
						<meta
							name="viewport"
							content="initial-scale=1.0, width=device-width"
						/>
					</Head>
					<AppDrawer global={global} />
					<AppBar global={global} />
				</>
			)}
			<main>
				<div className="grid">
					{page.length > 0 && (
						<>
							<Head>
								{['drawer', 'dialog', 'form', 'images', 'tabs', 'video'].map(
									(script, index) => (
										<script
											src={`https://thevillagesofdetroit.com/_astro/src/js/${script}.js`}
											key={index}
										/>
									)
								)}
							</Head>
							{page.map((blok) => (
								<Component blok={blok} key={blok._uid} />
							))}
						</>
					)}
				</div>
			</main>
			{global._uid && (
				<>
					{global.footer.map((blok) => (
						<Component blok={blok} key={blok._uid} />
					))}
					<div dangerouslySetInnerHTML={{ __html: global.custom_html }}></div>
				</>
			)}
		</>
	)
}

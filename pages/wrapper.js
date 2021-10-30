import Head from '../components/head'
import readMe from '../README.md'

import Markdown from '../components/Markdown'
import { PageWrapper } from '../styles/components'
import ListWrapper from '../components/ListWrapper'

export default function About() {
  return (
    <>
      <Head title={'List Wrapper'} />
        <ListWrapper />
    </>
  )
}

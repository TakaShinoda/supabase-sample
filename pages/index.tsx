import type { NextPage } from 'next'
import { useState, useEffect } from 'react'
import { supabase } from '../src/utils/supabaseClient'
import { Auth } from '../src/components/Auth'
import { Account } from '../src/components/Account'


const Home: NextPage = () => {
  const [session, setSession] = useState(null)

  useEffect(() => {
    // Returns the session data, if there is an active session.
    setSession(supabase.auth.session())

    // Receive a notification every time an auth event happens.
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  return (
    <div className="container" style={{ padding: '50px 0 100px 0' }}>
      {!session ? (
        <Auth />
      ) : (
        <Account key={session.user.id} session={session} />
      )}
    </div>
  )
}

export default Home

import React, { useState, useEffect } from 'react'
import { supabase } from '../utils/supabaseClient'
import { Avatar } from './Avatar'
import { definitions } from '../../types/supabase'

type Profile = {
  username: string | undefined | null
  website: string | undefined | null
  avatar_url: string | undefined | null
}

export const Account = ({ session }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [username, setUsername] = useState<string | undefined | null>(null)
  const [website, setWebsite] = useState<string | undefined | null>(null)
  const [avatar_url, setAvatarUrl] = useState<string | undefined | null>(null)

  useEffect(() => {
    getProfile()
  }, [session])

  const getProfile = async () => {
    try {
      setIsLoading(true)
      const user = supabase.auth.user()

      let { data, error, status } = await supabase
        .from<definitions['profiles']>('profiles')
        .select(`username, website, avatar_url`)
        .eq('id', user!.id)
        .single()

      if (error && status !== 406) {
        throw error
      }

      if (data) {
        setUsername(data.username)
        setWebsite(data.website)
        setAvatarUrl(data.avatar_url)
      }
    } catch (error) {
      alert(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const updateProfile = async ({ username, website, avatar_url }: Profile) => {
    try {
      setIsLoading(true)
      const user = supabase.auth.user()

      const updates = {
        id: user.id,
        username,
        website,
        avatar_url,
        updated_at: new Date(),
      }

      let { error } = await supabase.from('profiles').upsert(updates, {
        returning: 'minimal', // Don't return the value after inserting
      })

      if (error) {
        throw error
      }
    } catch (error) {
      alert(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="form-widget">
      <Avatar
        url={avatar_url}
        size={150}
        onUpload={(url: string) => {
          setAvatarUrl(url)
          updateProfile({ username, website, avatar_url: url })
        }}
      />
      <div>
        <label htmlFor="email">Email</label>
        <input id="email" type="text" value={session.user.email} disabled />
      </div>
      <div>
        <label htmlFor="username">Name</label>
        <input
          id="username"
          type="text"
          value={username || ''}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="website">Website</label>
        <input
          id="website"
          type="website"
          value={website || ''}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      <div>
        <button
          className="button block primary"
          onClick={() => updateProfile({ username, website, avatar_url })}
          disabled={isLoading}
        >
          {isLoading ? 'Loading ...' : 'Update'}
        </button>
      </div>

      <div>
        <button
          className="button block"
          onClick={() => supabase.auth.signOut()}
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}

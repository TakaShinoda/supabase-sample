import React, { useState, useEffect, VFC } from 'react'
import { supabase } from '../utils/supabaseClient'
import { Avatar } from './Avatar'
import { definitions } from '../../types/supabase'
import { User, Session } from '@supabase/gotrue-js'

type Profile = {
  username: string | undefined | null
  website: string | undefined | null
  avatar_url: string | undefined | null
}

type Props = {
  session: Session | null
}

export const Account: VFC<Props> = ({ session }) => {
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
      // ブラウザのコンテキスト内では、user()は、ログインしているユーザーがいれば、そのユーザーデータを返す
      const user: User | null = supabase.auth.user()

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
    } catch (error: any) {
      alert(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const updateProfile = async ({ username, website, avatar_url }: Profile) => {
    try {
      setIsLoading(true)
      const user: User | null = supabase.auth.user()

      const updates = {
        id: user.id,
        username,
        website,
        avatar_url,
        updated_at: new Date(),
      }

      // テーブルへのUPSERT(レコードがなければINSERTを行い、レコードがあればUPDATEを行う処理)を実行
      let { error } = await supabase.from('profiles').upsert(updates, {
        returning: 'minimal', // Don't return the value after inserting
      })

      if (error) {
        throw error
      }
    } catch (error: any) {
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
        {/* ブラウザコンテキスト内で、ログインしたユーザーをブラウザセッションから削除してログアウトする*/}
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

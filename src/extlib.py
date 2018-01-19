# coding:utf-8
import socket
import cgi,os,sys,io
import string
import random
import datetime
import locale
import re
import hashlib
import urllib
import datetime
import http
import http.cookies
import http.cookiejar
import mimetypes
import json
sys.path.append('/var/www/trashbox/source/src')
class extlib:
	def hashcode(self,i,s):
		d = datetime.datetime.today()
		n = d.strftime("%Y-%m")
		n = n.encode("ascii")
		n = hashlib.sha256( n ).hexdigest()
		n = n[i:s]
		return n
	def randcode(self,i):
		id = ''
		for i in range(0,i):
			id += random.choice("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ")
		id.encode()
		return id
	def strapp(self,tx):
		try:
			tx = tx.decode()
		except:
			pass
		tx = tx.replace(' ','_')
		tx = tx.replace('"','\'')
		tx = tx.replace('\\','_')
		ptn = re.compile('[_/<>\";=:]+')
		tx = ptn.sub('_',tx)
		tx.encode()
		return tx
	def uri_app(self,uri):
		try:
			uri.decode()
		except:
			pass
		ptn = re.compile('[.]+')
		uri = ptn.sub('.',uri)
		ptn = re.compile('[/]+')
		uri = ptn.sub('/',uri)
		uri.encode()
		return uri
	def str_encode(self,string):
		try:
			string.encode()
		except:
			pass
		return string
	def filelist(self,uri):
		uri = uri.encode("utf-8")
		if not os.path.isdir(uri):
			return False
		lsts = os.listdir( uri )
		pt_fil = []
		pt_dir = [] 
		fl_siz = {'@header':'fileSize'}
		fl_dat = {'@header':'timeStamp'}
		fl_mim = {'@header':'mime-type'}
		for lst in lsts:
			if lst == b'.htaccess' or lst == b'.htpasswd' or lst == b'.usrlog':
				continue
			nw = lst.decode()
			nw = nw.replace(' ','_')
			nw = nw.replace('\\','_')
			ptn = re.compile('[_/<>\":=;]+')
			if ptn.search(nw):
				nw = ptn.sub('_',nw)
				os.rename( uri + lst , uri + nw.encode() )
			lst = nw.encode()

			_url = (uri + lst).decode("utf-8")
			str_lst = lst.decode()
			str_url = _url.encode("utf-8")

			if os.path.isdir( str_url ):
				pt_dir.append( str_lst )
			elif not os.path.isdir( str_url ):
				pt_fil.append( str_lst )
				msize = os.path.getsize( str_url )
				fl_siz.update( { str_lst : str(msize) } )
				udt = datetime.datetime.fromtimestamp( os.stat( str_url ).st_mtime )
				mstmp = udt.strftime('%Y%m%d%H%M%S')
				fl_dat.update( { str_lst : mstmp } )
				mime = mimetypes.guess_type( str_lst )
				fl_mim.update( { str_lst : mime[0] } )
		dict_data = { 'fil_list':pt_fil , 'dir_list':pt_dir , 'fil_size':fl_siz , 'fil_date':fl_dat , 'fil_mime':fl_mim }
		return dict_data
	def headerlist(self,uri):
		uri = uri.encode("utf-8")
		if not os.path.isdir(uri):
			return False
		lsts = os.listdir( uri )
		ptn = re.compile('^\.')
		pt_fil = []
		dict_data = {}
		for lst in lsts:
			if lst == b'.htaccess' or lst == b'.htpasswd' or lst == b'.usrlog':
				continue
			_url = (uri + lst).decode("utf-8")
			str_lst = lst.decode()
			str_url = _url.encode("utf-8")
			if not os.path.isdir( str_url ) and re.match( ptn , str_lst ):
				pt_fil.append( lst )
		for lst in pt_fil:
			with open( uri + lst , "r") as fp:
				header = fp.read()
				if header:
					dict_data[ lst.decode() ] = header;
		return dict_data
	def htacs_default(self,branch):
		order = ''
		line = ''
		string = 'unknown'
		try:
			fil = open( branch.encode('utf-8') + b'.htaccess',"r")
		except:
			return string
		line = fil.readline()
		order = line.rstrip('\n')
		fil.close()
		if '#allow' in order:
			string = 'Allow'
		elif '#deny' in order:
			string = 'Deny'
		else:
			string = 'Unknown'
		return string
	def htacs_chauth(self,branch,o):
		dat = ''
		fil = open( branch.encode('utf-8') + b'/.htaccess',"w")
		if o == 'Deny':
			dat = '#deny\norder deny,allow\ndeny from all\ndeny from .berylna.mydns.jp\nSetEnvIf Host "\.berylna\.mydns\.jp" hos1_ok\ndeny from env=hos1_ok\nSetEnvIf Host "^ur\.berylna\.mydns\.jp" hos2_ok\nallow from env=hos2_ok\n'
		elif o == 'Allow':
			dat = '#allow\norder deny,allow\ndeny from all\ndeny from .berylna.mydns.jp\nSetEnvIf Host "\.berylna\.mydns\.jp" hos1_ok\nallow from env=hos1_ok\nSetEnvIf Host "^ur\.berylna\.mydns\.jp" hos2_ok\nallow from env=hos2_ok\n'
		else:
			dat = '#deny\norder deny,allow\ndeny from all\ndeny from .berylna.mydns.jp\nSetEnvIf Host "\.berylna\.mydns\.jp" hos1_ok\nallow from env=hos1_ok\nSetEnvIf Host "^ur\.berylna\.mydns\.jp" hos2_ok\nallow from env=hos2_ok\n'
		fil.write(dat)
		fil.close()
		return
	def webdav_rcrt(self,branch,ur,ky):
		n = ur + ':Digest Authentication:' + ky
		n = n.encode("ascii")
		n = hashlib.md5( n ).hexdigest()
		dat = ur + ':Digest Authentication:' + n + '\n'
		n_uri = '/var/www/berylna/usr/' + branch + '/.htdigest'
		fil = open( n_uri ,"w")
		fil.write(dat)
		fil.close()
		dat = 'order deny,allow\ndeny from all\nAuthType Digest\nAuthUserFile ' + n_uri + '\nAuthName "Digest Authentication"\n'
		n_uri = '/var/www/berylna/usr/' + branch + '/.htaccess'
		fil = open( n_uri ,"w")
		fil.write(dat)
		fil.close()
		return
	def usrlog_add(self,branch,string):
		n_uri = '/var/www/berylna/usr/' + branch
		if not os.path.isdir(n_uri):
			os.mkdir(n_uri)
		if not os.path.isdir(n_uri + '/d/'):
			os.mkdir(n_uri + '/d/')
		fil = open(n_uri + '/.usrlog',"a")
		fil.write( string )
		fil.close()
		fil = open(n_uri + '/.vslog',"w")
		fil.write( string )
		fil.close()
		return
	def usrlog_push(self,branch):
		n_uri = '/var/www/berylna/usr/' + branch
		if not os.path.isdir(n_uri):
			os.mkdir(n_uri)
		if not os.path.isdir(n_uri + '/d/'):
			os.mkdir(n_uri + '/d/')
		fil = open(n_uri + '/.vslog',"r")
		lines = fil.readline()
		fil.close()
		return lines
	def usrlog_auth(self,branch,obj):
		n_uri = '/var/www/berylna/usr/' + branch
		if not os.path.isdir(n_uri + '/d/'):
			return False
		try:
			fil = open(n_uri + '/.vslog',"r")
		except:
			return False
		lines = fil.readline().rstrip('\n')
		fil.close()
		if lines == obj:
			return True
		else:
			return False
class sqllib:
	def __init__(self):
		self.ExtLib = extlib()
		self.flag = False
		self.cnn = mysql.connector.connect(user='lcfrm',password='lcfrmv3',host='127.0.0.1',database='lcfrm',charset='utf8')
		self.cursor = self.cnn.cursor()
	def sql_act_match(self,lgn_nme,lgn_pwd):
		string = self.ExtLib.strapp(lgn_nme).encode()
		syntax = b'SELECT * FROM actuser WHERE passwd = \'' + lgn_pwd + b'\' AND ( id = \'' + string + b'\' OR id_hash = \'' + string + b'\' )'
		#syntax = b'SELECT * FROM actuser WHERE id = \'' + string + b'\' AND passwd = \'' + lgn_pwd + b'\''
		self.cursor.execute(syntax , () )
		rows = self.cursor.fetchall()
		if rows:
			return True
		else:
			return False
	def sql_act_search(self,target,value):
		syntax = b'SELECT * FROM actuser WHERE ' + self.ExtLib.strapp(target).encode() + b' = \'' + self.ExtLib.strapp(value).encode() + b'\''
		self.cursor.execute(syntax , () )
		rows = self.cursor.fetchall()
		if rows:
			return True
		else:
			return False
	def sql_act_putHash(self,usr,s):
		string = self.ExtLib.strapp(usr).encode()
		syntax = b''.join( [ b'SELECT * FROM actuser WHERE id = \'' , string , b'\' OR id_hash = \'' , string , b'\'' ] )
		self.cursor.execute(syntax , () )
		rows = self.cursor.fetchall()
		if rows:
			titl = rows[0]
			return titl[s]
		else:
			return False
	def sql_act_checkId(self,usr):
		string = self.ExtLib.strapp(usr).encode()
		syntax = b''.join( [ b'SELECT * FROM actuser WHERE id_hash = \'' , string , b'\'' ] )
		self.cursor.execute(syntax , () )
		rows = self.cursor.fetchall()
		if rows:
			return True
		else:
			return False
	def sql_act_insert(self,nme,pwd,adr):
		nme = self.ExtLib.strapp(nme).encode()
		syntax = b''.join( [ b'SELECT * FROM actuser WHERE id = \'' , nme , b'\'' ] )
		self.cursor.execute(syntax , () )
		rows = self.cursor.fetchall()
		if rows:
			return False
		else:
			self.flag = True
			i_pwd = hashlib.sha256( pwd ).hexdigest().encode()
			i_rand = self.ExtLib.randcode(8).encode()
			i_nme =  hashlib.sha256( nme ).hexdigest().encode()
			syntax = b''.join( [ b'INSERT INTO actuser values(\'',nme,b'\',\'',i_nme,b'\',\'',i_pwd,b'\',\'',i_rand,b'\',\'',adr.encode(),b'\')' ] )
			self.cursor.execute(syntax , () )
			self.cnn.commit()
		return self.flag
	def sql_act_update(self,target,data,wh,vl):
		syntax = 'UPDATE actuser SET ' + target + ' = \'' + data + '\' WHERE ' + wh + ' = \'' + vl + '\''
		self.cursor.execute(syntax , () )
		self.cnn.commit()
		return True
	def sql_act_close(self):
		try:
			self.cursor.close()
			self.cnn.close()
			return True
		except:
			return False


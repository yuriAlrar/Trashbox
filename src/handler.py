# coding:utf-8
import sys
import socket
import cgi
import os
import io
import os.path
import string
import random
import datetime
import locale
import hashlib
import urllib
from urllib.parse import urlparse
import datetime
import codecs
import http
import http.cookies
import http.cookiejar
import mimetypes
from wsgiref.util import request_uri

from Crypto.Cipher import AES
import binascii

sys.path.append('/var/www/trashbox/source/src')
import extlib
class handler:
	def __init__(self , env):
		self.ExtLib = extlib.extlib()
		self.usrid  = ''
		self.usropt = ''
		self.status = '200 OK'
		self.response = [('Content-type','text/html')]
		self.environ = env
		self.uri = b''
		self.name = ''
		self.mime = ''
		self.size = ''
	def setStatus(self,path):
		try:
			self.uri = path.encode('utf-8')
		except:
			self.uri = path
		self.name = str( os.path.basename( self.uri ) )
		self.mime = mimetypes.guess_type( self.uri.decode() )
		self.size = str( os.path.getsize( self.uri ) )
	def htmlOpen(self,path):
		try:
			self.uri = path.encode('utf-8')
		except:
			self.uri = path
		self.name = os.path.basename( self.uri ).decode()
		self.mime = mimetypes.guess_type( self.uri.decode() )
		self.size = str( os.path.getsize( self.uri ) )
		self.response = [ ('Content-type',self.mime[0]) ]
		result = open(path, "rb")
		return result
	def RspForDL(self):
		self.rand = self.ExtLib.hashcode(0,12);
		self.response = [('Content-Disposition','attachment;filename="' + self.rand + '"'), ('Content-Length',self.size),('Content-type',self.mime[0])]
	def dt216(self , delta ):
		nowTime   = datetime.datetime.now()
		deltaTime = nowTime + datetime.timedelta(minutes = delta)
		message   = deltaTime.strftime("00%Y%m%d%H%M%S")
		return message
	def keygen(self):
		key = ""
		with open( "/var/www/trashbox/dls/key.list" , "r" ) as f:
			cipher = AES.new( f.readline().strip().encode() )
#発行キーの生存時間
			key    = cipher.encrypt( self.dt216( 120 ) )
			h16    = binascii.hexlify( key )
		return h16.decode()
	def acsAuth( self , key = None ):
		debris = None
		flag = False
		message = None
		nt = None
		try:
			cookie = http.cookies.SimpleCookie()
			cookie.load(self.environ['HTTP_COOKIE'])
			debris = cookie["rst"].value
			flag = True
		except:
			debris = key
			flag = True
		if flag and debris is not None:
			with open( "/var/www/trashbox/dls/key.list" , "r" ) as f:
				cipher  = AES.new( f.readline().strip() )
				b16     = binascii.unhexlify( debris )
				message = cipher.decrypt( b16 ).decode()
				nt      = self.dt216( 0 )
		if message is not None and nt is not None and int(message) > int(nt):
			flag = True
		else:
			flag = False
		return flag
def application(environ, start_response):
	Handler = handler(environ)
	p = "/var/www/trashbox"
	d = p + "/source/src/default.html"
	v = p + "/source/src/view.html"
#get request
	method = environ.get('REQUEST_METHOD')
	if method == "GET":
		para = None
		uri = None
		form = cgi.parse_qsl(environ.get('QUERY_STRING'))
		for params in form:
			if params[0] == 'para' and params[1]:
				para = params[1]
				uri = ( "/var/www/trashbox/archive/" + para)
		if para and os.path.isfile(uri):
			result = Handler.htmlOpen(v)
			start_response('200 OK', Handler.response)
			return result

	nowTime = datetime.datetime.utcnow()
	n = nowTime.strftime("%H%M%S")
	expiration = nowTime + datetime.timedelta(minutes = 120)
	if Handler.acsAuth():
		start_response( Handler.status , Handler.response )
	else:
		cookie = http.cookies.SimpleCookie()
		cookie["rst"] = Handler.keygen()
		cookie["rst"]["path"] = "./"
		cookie["rst"]["expires"] = expiration.strftime("%a, %d-%b-%Y %H:%M:%S GMT")
		start_response('200 OK', [('Content-type', 'text/html'),('Set-Cookie', cookie["rst"].OutputString())])
	result = Handler.htmlOpen(d)
	return result

